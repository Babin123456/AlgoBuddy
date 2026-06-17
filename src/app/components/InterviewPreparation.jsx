"use client";

import React from "react";
import {
  Briefcase,
  CheckCircle,
  Calendar,
  Target,
  TrendingUp,
} from "lucide-react";

const tracks = [
  {
    level: "Beginner",
    topics: "Arrays, Strings, Sorting, Searching",
    progress: "40%",
  },
  {
    level: "Intermediate",
    topics: "Linked List, Stack, Queue, Trees, Graphs",
    progress: "25%",
  },
  {
    level: "Advanced",
    topics: "Dynamic Programming, System Design, Advanced Graphs",
    progress: "10%",
  },
];

const companies = [
  "Google",
  "Microsoft",
  "Amazon",
  "Meta",
  "Adobe",
];

const checklist = [
  "Complete 100 DSA Problems",
  "Master Sorting & Searching",
  "Practice Trees and Graphs",
  "Solve Dynamic Programming Problems",
  "Attend Mock Interviews",
];

export default function InterviewPreparation() {
  return (
    <div className="w-full max-w-5xl mx-auto my-6 p-5 bg-slate-900 text-white rounded-2xl shadow-lg">

      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <Briefcase className="text-blue-400" />
        <h2 className="text-2xl font-bold">
          DSA Interview Preparation Mode
        </h2>
      </div>

      {/* Learning Tracks */}
      <div className="space-y-4">
        {tracks.map((track, index) => (
          <div
            key={index}
            className="bg-slate-800 p-4 rounded-xl border border-slate-700"
          >
            <div className="flex justify-between">
              <h3 className="text-lg font-semibold">
                {track.level} Track
              </h3>
              <span className="text-green-400 font-bold">
                {track.progress}
              </span>
            </div>

            <p className="text-slate-400 mt-2">
              {track.topics}
            </p>
          </div>
        ))}
      </div>

      {/* Company Recommendations */}
      <div className="mt-6">
        <h3 className="flex items-center gap-2 text-lg font-bold">
          <Target className="text-purple-400" size={18}/>
          Company-Oriented Preparation
        </h3>

        <div className="flex flex-wrap gap-2 mt-3">
          {companies.map((company, index) => (
            <span
              key={index}
              className="bg-purple-600 px-3 py-2 rounded-lg text-sm"
            >
              {company}
            </span>
          ))}
        </div>
      </div>

      {/* Schedule */}
      <div className="mt-6 bg-slate-800 p-4 rounded-xl border border-slate-700">
        <h3 className="flex items-center gap-2 font-bold">
          <Calendar className="text-yellow-400" size={18}/>
          Weekly Preparation Plan
        </h3>

        <p className="text-slate-400 mt-2">
          Practice 2 algorithms daily, revise concepts every weekend,
          and complete one mock interview per week.
        </p>
      </div>

      {/* Checklist */}
      <div className="mt-6">
        <h3 className="flex items-center gap-2 font-bold">
          <TrendingUp className="text-green-400" size={18}/>
          Interview Readiness Checklist
        </h3>

        <div className="mt-3 space-y-2">
          {checklist.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-2"
            >
              <CheckCircle
                size={18}
                className="text-green-400"
              />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}