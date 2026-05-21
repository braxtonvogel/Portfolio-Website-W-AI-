"use client";

import { useState } from "react";
import Link from "next/link";
import { searchSkills } from "@/lib/fakeAI";

export default function FloatingFakeAI() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [response, setResponse] = useState<any>(null);

  function handleAsk() {
    const results = searchSkills(input);

    if (results.length === 0) {
      setResponse({
        type: "none",
        text: "Hmm… I don’t see a direct match yet. Braxton is still building new skills — feel free to explore his projects.",
      });
      return;
    }

    const first = results[0];

    setResponse({
      type: "match",
      text: `Yes — Braxton has experience with "${input}" from his ${first.project.title} project.`,
      project: first.project,
    });
  }

  return (
    <>
      {/* ================= FLOATING BUTTON ================= */}
      <button
        onClick={() => setOpen(!open)}
        className="
          fixed bottom-6 right-6
          w-14 h-14
          rounded-full
          bg-white text-black
          font-bold text-xl
          shadow-lg
          hover:scale-110 transition
          z-50
        "
      >
        AI
      </button>

      {/* ================= CHAT BOX ================= */}
      {open && (
        <div
          className="
            fixed bottom-6 left-6
            w-80 sm:w-96
            bg-black border border-white
            rounded-xl p-4
            z-50
            flex flex-col gap-3
          "
        >
          <h2 className="text-lg font-semibold">Ask AI</h2>

          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about skills (SQL, React...)"
            className="p-2 bg-black border border-white rounded text-sm"
          />

          <button
            onClick={handleAsk}
            className="px-3 py-2 border border-white rounded hover:bg-white hover:text-black transition"
          >
            Ask
          </button>

          {response && (
            <div className="text-sm text-zinc-300 space-y-2 mt-2">
              <p>{response.text}</p>

              {response.type === "match" && (
                <Link
                  href={`/projects/${response.project.slug}`}
                  className="text-blue-400 underline"
                >
                  View Project →
                </Link>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}