import { Spinner } from "@/app/components/ui/SuspenseContainer";

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white dark:bg-slate-950 transition-colors duration-300">
      <div className="flex flex-col items-center gap-6">
        <div className="relative flex items-center justify-center">
          <div className="absolute w-20 h-20 rounded-full border-4 border-indigo-500/20 dark:border-purple-500/20 animate-ping" />
          <Spinner size="lg" />
          <div className="absolute font-mono text-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent animate-pulse">
            {"{ }"}
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-base font-semibold tracking-wide text-gray-700 dark:text-gray-300 animate-pulse">
            Initializing AlgoBuddy...
          </h2>
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
            Optimizing your workspace
          </p>
        </div>
      </div>
    </div>
  );
}
