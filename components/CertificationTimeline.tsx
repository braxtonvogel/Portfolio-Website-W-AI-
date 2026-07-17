"use client";

import { useState } from "react";
import type { CertSegment } from "@/lib/certifications";

export default function CertificationTimeline({
  segments,
}: {
  segments: CertSegment[];
}) {
  const [expanded, setExpanded] = useState<number | null>(null);

  const toggle = (i: number) => {
    setExpanded((prev) => (prev === i ? null : i));
  };

  return (
    <div className="relative mt-16 mx-auto max-w-3xl">
      {/* animated wavy center line */}
      <svg
        className="pointer-events-none absolute left-1/2 top-0 h-full w-16 -translate-x-1/2"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a1a1aa" stopOpacity="0.15" />
            <stop offset="50%" stopColor="#a1a1aa" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#a1a1aa" stopOpacity="0.15" />
          </linearGradient>
          <pattern
            id="wavePattern"
            width="100"
            height="100"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M50 0 C 15 25, 85 25, 50 50 C 15 75, 85 75, 50 100"
              stroke="url(#lineGradient)"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
            <animateTransform
              attributeName="patternTransform"
              type="translate"
              from="0 0"
              to="0 100"
              dur="6s"
              repeatCount="indefinite"
            />
          </pattern>
        </defs>
        <rect width="100" height="100%" fill="url(#wavePattern)" />
      </svg>

      <div className="relative space-y-10">
        {segments.map((segment, i) => {
          const isLeft = i % 2 === 0;
          const isOpen = expanded === i;

          return (
            <div key={i} className="relative flex justify-center">
              {/* center dot */}
              <span className="absolute left-1/2 top-6 z-10 h-3 w-3 -translate-x-1/2 rounded-full bg-zinc-500 ring-4 ring-zinc-50 dark:ring-black" />

              <div
                className={`w-full sm:w-1/2 ${
                  isLeft
                    ? "sm:pr-10 sm:text-right sm:mr-auto"
                    : "sm:pl-10 sm:text-left sm:ml-auto"
                }`}
              >
                <button
                  onClick={() => toggle(i)}
                  className="w-full text-left p-5 border rounded-xl bg-white dark:bg-zinc-950 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors"
                >
                  <div
                    className={`flex items-center gap-2 ${
                      isLeft ? "sm:flex-row-reverse sm:justify-start" : ""
                    }`}
                  >
                    <h3 className="font-semibold">
                      {i + 1}. {segment.title}
                    </h3>
                    <svg
                      className={`h-4 w-4 flex-shrink-0 transition-transform ${
                        isOpen ? "rotate-180" : ""
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>

                  <p className="text-zinc-600 dark:text-zinc-400 mt-1 text-sm">
                    {segment.description}
                  </p>

                  <div
                    className={`grid transition-all duration-300 ease-in-out ${
                      isOpen
                        ? "grid-rows-[1fr] opacity-100 mt-3"
                        : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="text-zinc-700 dark:text-zinc-300 text-sm">
                        {segment.details ?? segment.description}
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}