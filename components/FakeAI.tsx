"use client";

import { useEffect, useRef, useState } from "react";

type Message = {
  role: "user" | "ai";
  content: string;
};

export default function FakeAI() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  // Auto-focus + initial disclaimer message
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);

      // only show disclaimer once per open session
      setMessages((prev) => {
        if (prev.length === 0) {
          return [
            {
              role: "ai",
              content:
                "Quick note: I may not include every detail of Braxton’s experience. For full accuracy, please review his project pages alongside using this assistant.",
            },
          ];
        }
        return prev;
      });
    }
  }, [open]);

  // Normalize input so "spring boot" === "springboot"
  function normalize(text: string) {
    return text.toLowerCase().replace(/\s+/g, "").trim();
  }

  const handleSend = () => {
    if (!input.trim()) return;

    const q = normalize(input);

    setMessages((prev) => [...prev, { role: "user", content: input }]);

    let response = "";

    if (q.includes("springboot")) {
      response =
        "Yes — Braxton has Spring Boot experience from his D&D Character Builder project.";
    } else if (q.includes("sql")) {
      response =
        "Yes — Braxton has SQL experience from his D&D Character Builder project.";
    } else if (q.includes("python")) {
      response =
        "Yes — Braxton has Python experience from multiple projects including his Student Risk Prediction System.";
    } else if (q.includes("java")) {
      response =
        "Yes — Braxton has Java experience from his Chat Server project.";
    } else if (q.includes("machinelearning") || q.includes("ml")) {
      response =
        "Yes — Braxton has machine learning experience from his Student Risk Prediction System.";
    } else {
      response =
        "That topic isn’t explicitly listed, but check his projects for related experience.";
    }

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: response },
      ]);
    }, 300);

    setInput("");
  };

  return (
    <>
      {/* ================= FLOATING BUBBLE ================= */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="
            fixed bottom-6 right-6
            w-14 h-14 rounded-full
            bg-zinc-700 text-white
            font-bold
            shadow-lg shadow-black/40
            hover:bg-zinc-600 hover:scale-110 transition
            z-50
          "
        >
          AI
        </button>
      )}

      {/* ================= CHAT WINDOW ================= */}
      {open && (
        <div
          className="
            fixed bottom-6 right-6
            w-80 h-96
            bg-black text-white
            border border-white
            rounded-xl
            flex flex-col
            z-50
            shadow-2xl
          "
        >
          {/* HEADER */}
          <div className="flex justify-between items-center p-3 border-b border-white">
            <h2 className="text-sm font-semibold">
              Portfolio Assistant
            </h2>

            <button
              onClick={() => setOpen(false)}
              className="text-xl font-bold hover:scale-125 transition"
            >
              ✕
            </button>
          </div>

          {/* MESSAGES */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`text-sm p-2 rounded-lg max-w-[85%] ${
                  m.role === "user"
                    ? "ml-auto bg-white text-black"
                    : "mr-auto bg-zinc-800 text-white"
                }`}
              >
                {m.content}
              </div>
            ))}

            <div ref={chatEndRef} />
          </div>

          {/* INPUT */}
          <div className="p-2 border-t border-white flex gap-2">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSend();
              }}
              className="flex-1 p-2 bg-black border border-white text-white rounded"
              placeholder="Ask about skills..."
            />

            <button
              onClick={handleSend}
              className="px-3 border border-white rounded hover:bg-white hover:text-black"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}