"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";

export default function Animation() {
  const [text, setText] = useState("AlgoBuddy");

  const frequency = useMemo(() => {
    const map = {};

    for (const ch of text) {
      const key = ch.toLowerCase();

      if (key === " ") continue;

      map[key] = (map[key] || 0) + 1;
    }

    return Object.entries(map);
  }, [text]);

  return (
    <div className="space-y-6">
      <div>
        <label className="font-medium text-sm">
          Enter a String
        </label>

        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="mt-2 w-full rounded-lg border p-3 outline-none focus:ring-2 focus:ring-pink-500"
          placeholder="Enter text..."
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {frequency.map(([char, count], index) => (
          <motion.div
            key={char}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            className="rounded-xl border p-5 text-center bg-pink-50"
          >
            <div className="text-3xl font-bold text-pink-600">
              {char}
            </div>

            <div className="mt-2 text-gray-600">
              Frequency
            </div>

            <div className="text-2xl font-bold">
              {count}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}