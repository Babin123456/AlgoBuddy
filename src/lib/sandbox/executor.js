const vm = require("vm");
const { Worker } = require("worker_threads");
const { EXECUTION_STATUS } = require("./errorCodes");
const { MAX_TIMEOUT_MS, MAX_MEMORY_MB, MAX_OUTPUT_LENGTH } = require("./sandbox.config");

const MEMORY_LIMIT_BYTES = MAX_MEMORY_MB * 1024 * 1024;
const MEMORY_POLL_INTERVAL_MS = 30;

async function executeCode(code) {
  const startTime = Date.now();
  const memoryBefore = process.memoryUsage().heapUsed;

  if (memoryBefore > MEMORY_LIMIT_BYTES) {
    return {
      status: EXECUTION_STATUS.MLE,
      output: "",
      error: `Server memory exhausted before execution. Try again later.`,
      executionTime: 0,
      memoryUsed: memoryBefore,
    };
  }

  const abortController = new AbortController();

  const workerCode = `
    const vm = require("vm");
    const { parentPort, workerData } = require("worker_threads");
    const { code, MAX_TIMEOUT_MS, MAX_OUTPUT_LENGTH } = workerData;
    const outputLines = [];
    const startTime = Date.now();

    try {
      const sandbox = Object.create(null);
      sandbox.console = {
        log:   (...a) => outputLines.push(a.map(String).join(" ")),
        warn:  (...a) => outputLines.push("[warn] " + a.map(String).join(" ")),
        error: (...a) => outputLines.push("[error] " + a.map(String).join(" ")),
        info:  (...a) => outputLines.push("[info] " + a.map(String).join(" ")),
      };

      const context = vm.createContext(sandbox);

      vm.runInContext(\`
        Object.freeze(Object.prototype);
        Object.freeze(Array.prototype);
        Object.freeze(Function.prototype);
      \`, context);

      const script = new vm.Script(code, { filename: "user-code.js" });
      const memBefore = process.memoryUsage().heapUsed;

      script.runInContext(context, {
        timeout: MAX_TIMEOUT_MS,
        breakOnSigint: true,
      });

      const memAfter = process.memoryUsage().heapUsed;
      const rawOutput = outputLines.join("\\n");
      const output = rawOutput.length > MAX_OUTPUT_LENGTH
        ? rawOutput.slice(0, MAX_OUTPUT_LENGTH) + "\\n… (output truncated)"
        : rawOutput;

      parentPort.postMessage({
        status: "success",
        output,
        executionTime: Date.now() - startTime,
        memoryUsed: memAfter - memBefore,
      });
    } catch (err) {
      const elapsed = Date.now() - startTime;

      if (err.code === "ERR_SCRIPT_EXECUTION_TIMEOUT" || err.message?.includes("timed out")) {
        parentPort.postMessage({
          status: "tle",
          output: "",
          error: \`Your code exceeded the \${MAX_TIMEOUT_MS}ms time limit.\`,
          executionTime: elapsed,
          memoryUsed: 0,
        });
        return;
      }

      const memoryErr = (err.message && (
        err.message.includes("memory") ||
        err.message.includes("allocation") ||
        err.message.includes("heap")
      )) || err.code === "ERR_MEMORY_ALLOCATION_FAILED";

      if (memoryErr) {
        parentPort.postMessage({
          status: "mle",
          output: outputLines.join("\\n"),
          error: \`Your code used too much memory (exceeded \${MAX_MEMORY_MB} MB).\`,
          executionTime: elapsed,
          memoryUsed: process.memoryUsage().heapUsed - memBefore,
        });
        return;
      }

      parentPort.postMessage({
        status: "runtime_error",
        output: outputLines.join("\\n"),
        error: err.message ?? String(err),
        executionTime: elapsed,
        memoryUsed: 0,
      });
    }
  `;

  const worker = new Worker(workerCode, {
    eval: true,
    workerData: { code, MAX_TIMEOUT_MS, MAX_OUTPUT_LENGTH },
  });

  return new Promise((resolve) => {
    const hardKillTimer = setTimeout(() => {
      abortController.abort();
      worker.terminate();
      resolve({
        status: EXECUTION_STATUS.TLE,
        output: "",
        error: `Your code exceeded the ${MAX_TIMEOUT_MS}ms time limit and was hard-killed.`,
        executionTime: Date.now() - startTime,
        memoryUsed: 0,
      });
    }, MAX_TIMEOUT_MS + 3000);

    const memoryPoll = setInterval(() => {
      const memDelta = process.memoryUsage().heapUsed - memoryBefore;
      if (memDelta > MEMORY_LIMIT_BYTES) {
        clearTimeout(hardKillTimer);
        abortController.abort();
        worker.terminate();
        resolve({
          status: EXECUTION_STATUS.MLE,
          output: "",
          error: `Your code used ${Math.round(memDelta / 1024 / 1024)} MB of memory, exceeding the ${MAX_MEMORY_MB} MB limit.`,
          executionTime: Date.now() - startTime,
          memoryUsed: memDelta,
        });
      }
    }, MEMORY_POLL_INTERVAL_MS);

    const onMessage = (result) => {
      clearTimeout(hardKillTimer);
      clearInterval(memoryPoll);
      abortController.abort();
      worker.removeListener("message", onMessage);
      worker.removeListener("error", onError);

      const statusMap = {
        success:   EXECUTION_STATUS.SUCCESS,
        tle:       EXECUTION_STATUS.TLE,
        mle:       EXECUTION_STATUS.MLE,
        runtime_error: EXECUTION_STATUS.RUNTIME_ERROR,
      };

      resolve({
        status: statusMap[result.status] ?? EXECUTION_STATUS.RUNTIME_ERROR,
        output: result.output ?? "",
        error: result.error ?? null,
        executionTime: result.executionTime,
        memoryUsed: result.memoryUsed,
      });
    };

    const onError = (err) => {
      clearTimeout(hardKillTimer);
      clearInterval(memoryPoll);
      abortController.abort();
      worker.removeListener("message", onMessage);
      worker.removeListener("error", onError);

      resolve({
        status: EXECUTION_STATUS.RUNTIME_ERROR,
        output: "",
        error: `Worker error: ${err.message ?? String(err)}`,
        executionTime: Date.now() - startTime,
        memoryUsed: 0,
      });
    };

    worker.on("message", onMessage);
    worker.on("error", onError);
  });
}

module.exports = { executeCode };