"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";

function Section({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
    >
      {children}
    </div>
  );
}

const TECH_STACK = [
  { label: "Tauri v2", desc: "Native desktop runtime" },
  { label: "Next.js 15", desc: "App Router + SSR" },
  { label: "Rust", desc: "System-level backend" },
  { label: "Zustand", desc: "Client state" },
  { label: "Redis (Upstash)", desc: "Rate limits + telemetry" },
  { label: "Python", desc: "Silent launcher logic" },
  { label: "Vercel", desc: "Backend + live dashboard" },
  { label: "Multi-LLM", desc: "OpenAI · Anthropic · Groq · Gemini · Cerebras" },
];

const FEATURES = [
  {
    icon: "🖥️",
    title: "Screen Awareness",
    desc: "Sam captures your active window in real time, reads its content, and answers questions about exactly what you're looking at — no copy-paste needed.",
  },
  {
    icon: "🎙️",
    title: "Live Audio Transcription",
    desc: "Listens to your microphone or meeting audio and pipes the live transcript directly into the AI context window.",
  },
  {
    icon: "📂",
    title: "File & Codebase Reading",
    desc: "Upload individual files or entire codebases. Sam parses the structure and answers questions across the full content tree.",
  },
  {
    icon: "🔬",
    title: "Autonomous Deep Research",
    desc: "Kick off a multi-step research job. Sam searches, synthesizes, and saves a polished report to your Knowledge Vault automatically.",
  },
  {
    icon: "🗄️",
    title: "Knowledge Vault",
    desc: "Every research report is persisted to a personal cloud vault with full-text search, upload counters, and job-status polling.",
  },
  {
    icon: "🔑",
    title: "Bring Your Own Key",
    desc: "Store your OpenAI, Anthropic, Groq, or custom endpoint key. It gets priority in the provider chain, with free-tier fallback if missing.",
  },
  {
    icon: "🔒",
    title: "Hardened Auth",
    desc: "Rate-limited login and register routes (per-IP + per-account counters), bcrypt password hashing, JWT sessions, and CORS-locked API boundaries.",
  },
  {
    icon: "🚀",
    title: "Silent One-Click Launcher",
    desc: "SammyOS.vbs double-click starts the app with zero terminal windows — auto-checks for GitHub updates, validates dependencies, and self-deletes its Task Scheduler entry to prevent double-launch.",
  },
];

const TIMELINE = [
  { version: "v1–v3", label: "Foundation", detail: "Tauri + Next.js scaffold, Rust backend commands, screen capture, active window detection." },
  { version: "v4–v6", label: "AI Core", detail: "Multi-LLM routing (Groq → Gemini → Cerebras), floating chat window, file/codebase upload pipeline, autonomous research loop." },
  { version: "v7", label: "Auth System", detail: "Full register/login, Zustand auth store, JWT sessions, key injection, conditional shell with hydration guard." },
  { version: "v8", label: "Telemetry", detail: "Live dashboard (sammyos-live.vercel.app), 4-event telemetry pipeline, Redis stat aggregation." },
  { version: "v9", label: "Settings + Keys", detail: "User-supplied API key UI, custom endpoint support, provider priority chain updated." },
  { version: "v10", label: "Hardening + Launch", detail: "Silent VBS launcher, rate-limited auth routes, TOS/Privacy pages, vault ping pipeline, pre-GitHub hygiene checklist." },
];

export default function SammyOSProject() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [backupOpen, setBackupOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress((scrollTop / docHeight) * 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main className="max-w-5xl mx-auto px-6 py-16 text-black dark:text-white">

      {/* PROGRESS BAR */}
      <div className="fixed top-0 left-0 w-full h-[2px] bg-zinc-200 dark:bg-zinc-800 z-50">
        <div
          className="h-full bg-gradient-to-r from-violet-500 via-blue-500 to-cyan-400 transition-all duration-100"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* BACK */}
      <Section>
        <Link href="/" className="text-sm text-zinc-400 hover:text-white transition-colors duration-200">
          ← Back to Home
        </Link>
      </Section>

      {/* TITLE + TAGLINE */}
      <Section delay={50}>
        <div className="mt-8 space-y-3">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-0.5 text-xs font-mono rounded-full border border-violet-500/40 text-violet-400 bg-violet-500/10">
              v10 · June 2026
            </span>
            <span className="px-2.5 py-0.5 text-xs font-mono rounded-full border border-emerald-500/40 text-emerald-400 bg-emerald-500/10">
              Live
            </span>
          </div>
          <h1 className="text-5xl font-bold tracking-tight">
            SammyOS
          </h1>
          <p className="text-xl text-zinc-400 font-light max-w-2xl">
            A native Windows AI workspace where your assistant sees your screen, hears your audio, reads your code, and researches autonomously — all at once.
          </p>
        </div>
      </Section>

      {/* TECH PILLS */}
      <Section delay={100}>
        <div className="flex flex-wrap gap-2 mt-6">
          {TECH_STACK.map((t) => (
            <span
              key={t.label}
              className="group relative px-3 py-1 text-xs rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 cursor-default"
              title={t.desc}
            >
              {t.label}
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-black text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-10">
                {t.desc}
              </span>
            </span>
          ))}
        </div>
      </Section>

      {/* LINKS */}
      <Section delay={130}>
        <div className="flex flex-wrap gap-3 mt-7">
          <a
            href="https://github.com/braxtonvogel/SammyOS-AI-Workspace"
            target="_blank"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-black text-white dark:bg-white dark:text-black text-sm font-medium hover:scale-105 transition-transform"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            GitHub Repo
          </a>
          <a
            href="https://nexus-analyzer-three.vercel.app/"
            target="_blank"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-zinc-300 dark:border-zinc-600 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
            Nexus Analyzer
          </a>
          <a
            href="https://sammyos-live.vercel.app/"
            target="_blank"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-zinc-300 dark:border-zinc-600 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Live Dashboard
          </a>
        </div>
      </Section>

      {/* VIDEO */}
      <Section delay={160}>
        <div className="mt-12">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Project Walkthrough</h2>
            <button
              onClick={() => setBackupOpen(true)}
              className="px-4 py-1.5 text-xs border border-zinc-300 dark:border-zinc-600 rounded-full hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
            >
              Backup Video ↗
            </button>
          </div>
          <div className="aspect-video bg-zinc-900 rounded-2xl border border-zinc-800 flex items-center justify-center">
            <iframe
              src=""
              className="w-full h-full rounded-2xl"
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          </div>
        </div>
      </Section>

      {/* BACKUP MODAL */}
      {backupOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-zinc-950 border border-zinc-700 rounded-2xl w-[90%] max-w-4xl p-4 relative">
            <button onClick={() => setBackupOpen(false)} className="absolute top-3 right-4 text-zinc-400 hover:text-white text-xl">
              ✕
            </button>
            <iframe src="" className="w-full h-[500px] rounded-xl" allow="autoplay" />
          </div>
        </div>
      )}

      {/* OVERVIEW */}
      <Section delay={200}>
        <div className="mt-14 grid md:grid-cols-2 gap-8 items-start">
          <div>
            <h2 className="text-2xl font-semibold mb-4">What is SammyOS?</h2>
            <p className="text-zinc-600 dark:text-zinc-300 leading-7">
              SammyOS is a native Windows desktop application — not a web app. It wraps a full Next.js frontend inside a Tauri v2 shell with a Rust backend, giving it low-level OS access that a browser-based tool can't touch: real-time screen capture, system audio, native window management, and a silent one-click launcher with auto-update from GitHub.
            </p>
            <p className="text-zinc-600 dark:text-zinc-300 leading-7 mt-4">
              The central assistant, <strong>Sam</strong>, maintains simultaneous awareness of your screen, microphone, uploaded files, and an autonomous research thread — and synthesizes all four into a single coherent answer.
            </p>
          </div>
          <div className="space-y-3">
            {[
              ["Backend", "nexus-analyzer (Next.js API on Vercel)"],
              ["Auth", "JWT · bcrypt · rate-limited routes"],
              ["State", "Zustand (client) + Redis (server)"],
              ["LLM chain", "Custom → Ollama → Groq → Gemini → Cerebras"],
              ["Launcher", "SammyOS.vbs → launch.py → Task Scheduler"],
              ["Telemetry", "4-event pipeline → sammyos-live.vercel.app"],
            ].map(([k, v]) => (
              <div key={k} className="flex gap-3 text-sm">
                <span className="text-zinc-400 w-28 shrink-0">{k}</span>
                <span className="font-mono text-zinc-700 dark:text-zinc-300">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* FEATURE EXPLORER */}
      <Section delay={240}>
        <div className="mt-14">
          <h2 className="text-2xl font-semibold mb-6">Feature Explorer</h2>
          <div className="grid md:grid-cols-3 gap-3">
            {FEATURES.map((f, i) => (
              <button
                key={i}
                onClick={() => setActiveFeature(i)}
                className={`text-left p-4 rounded-xl border transition-all duration-200 ${
                  activeFeature === i
                    ? "border-violet-500 bg-violet-500/10 text-black dark:text-white"
                    : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 text-zinc-600 dark:text-zinc-400"
                }`}
              >
                <span className="text-xl">{f.icon}</span>
                <p className="mt-2 text-sm font-medium text-black dark:text-white">{f.title}</p>
              </button>
            ))}
          </div>
          <div className="mt-4 p-5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 min-h-[80px] transition-all duration-300">
            <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-7">
              {FEATURES[activeFeature].desc}
            </p>
          </div>
        </div>
      </Section>

      {/* VISUALS */}
      <Section delay={270}>
        <h2 className="text-2xl font-semibold mt-14 mb-6">Interface & Architecture</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-widest mb-2">Desktop App</p>
            <Image
              src="/sammyos_interface.png"
              alt="SammyOS Desktop App"
              width={900}
              height={600}
              className="rounded-xl border border-zinc-200 dark:border-zinc-700"
            />
          </div>
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-widest mb-2">Live Dashboard</p>
            <Image
              src="/sammyos_dashboard.png"
              alt="SammyOS Live Dashboard"
              width={900}
              height={600}
              className="rounded-xl border border-zinc-200 dark:border-zinc-700"
            />
          </div>
        </div>
      </Section>

      {/* BUILD TIMELINE */}
      <Section delay={300}>
        <div className="mt-14">
          <h2 className="text-2xl font-semibold mb-8">Build Timeline</h2>
          <div className="relative border-l border-zinc-300 dark:border-zinc-700 ml-3 space-y-8">
            {TIMELINE.map((item, i) => (
              <div key={i} className="pl-8 relative">
                <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-violet-500 bg-white dark:bg-black" />
                <div className="flex items-baseline gap-3 mb-1">
                  <span className="font-mono text-xs text-violet-400">{item.version}</span>
                  <span className="font-semibold text-sm">{item.label}</span>
                </div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-6">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* PROJECT STRUCTURE */}
      <Section delay={330}>
        <h2 className="text-2xl font-semibold mt-14 mb-4">Project Structure</h2>
        <pre className="text-xs bg-zinc-950 text-zinc-300 p-5 rounded-2xl overflow-x-auto border border-zinc-800 leading-6">
{`SammyOS/
│
├── SammyOS.vbs              ← silent Windows launcher (no cmd window)
├── launch.py                ← launcher: dep checks, GitHub update pull, Task Scheduler
│
├── apps/
│   └── desktop/             ← Main Tauri + Next.js app
│       ├── src-tauri/
│       │   └── src/
│       │       └── main.rs  ← Rust backend (screen capture, window detect, Tauri cmds)
│       ├── app/
│       │   ├── login/       ← auth gate + TOS checkbox
│       │   ├── chat/        ← main Sam chat UI
│       │   ├── vault/       ← Knowledge Vault browser
│       │   ├── workspace/   ← file/codebase uploader
│       │   ├── research/    ← autonomous research launcher
│       │   ├── settings/    ← API key management
│       │   ├── chat-float/  ← detachable floating chat window
│       │   └── api/
│       │       ├── chat/    ← multi-LLM routing + key injection
│       │       ├── vault/   ← vault CRUD + ping counter
│       │       ├── research/← job queue + polling
│       │       └── settings/
│       └── components/
│           ├── layout/      ← ConditionalShell (auth guard + hydration)
│           └── chat/        ← ChatHistoryPanel, VaultUpload, FloatButton
│
└── nexus-analyzer/          ← Vercel backend (separate repo)
    └── app/api/
        ├── auth/            ← register, login, keys (rate-limited)
        ├── vault/           ← ping route + job processing
        └── telemetry/       ← stats aggregation → sammyos-live`}
        </pre>
      </Section>

      {/* HOW TO RUN */}
      <Section delay={360}>
        <h2 className="text-2xl font-semibold mt-14">How to Run</h2>
        <div className="mt-5 space-y-5 text-sm text-zinc-600 dark:text-zinc-300">
          <div>
            <p className="font-semibold text-black dark:text-white mb-2">1 · Clone the repo</p>
            <pre className="bg-zinc-950 text-zinc-200 p-4 rounded-xl font-mono">
git clone https://github.com/braxtonvogel/SammyOS-AI-Workspace.git
cd SammyOS-AI-Workspace</pre>
          </div>
          <div>
            <p className="font-semibold text-black dark:text-white mb-2">2 · Install dependencies</p>
            <pre className="bg-zinc-950 text-zinc-200 p-4 rounded-xl font-mono">
cd apps/desktop
npm install</pre>
          </div>
          <div>
            <p className="font-semibold text-black dark:text-white mb-2">3 · Run in dev mode (Tauri)</p>
            <pre className="bg-zinc-950 text-zinc-200 p-4 rounded-xl font-mono">
npm run tauri dev</pre>
          </div>
          <div>
            <p className="font-semibold text-black dark:text-white mb-2">4 · Or launch silently on Windows</p>
            <p>Double-click <code className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-xs">SammyOS.vbs</code> from the repo root. The launcher checks dependencies, pulls any GitHub updates, and starts the app — no terminal window.</p>
          </div>
        </div>
      </Section>

      {/* SKILLS GAINED */}
      <Section delay={400}>
        <div className="mt-14 pt-10 border-t border-zinc-200 dark:border-zinc-800">
          <h2 className="text-2xl font-semibold mb-6">Skills Demonstrated</h2>
          <div className="grid sm:grid-cols-2 gap-6 text-sm text-zinc-600 dark:text-zinc-300">
            {[
              {
                title: "Desktop App Development",
                items: [
                  "Tauri v2 + Rust native backend integration",
                  "Real-time screen capture & active window detection",
                  "Silent VBS/Python launcher with Task Scheduler",
                  "Cross-platform app packaging",
                ],
              },
              {
                title: "AI & Systems Integration",
                items: [
                  "Multi-LLM provider routing with fallback chain",
                  "Real-time audio transcription pipeline",
                  "Autonomous multi-step AI research loops",
                  "User-supplied key injection with priority routing",
                ],
              },
              {
                title: "Backend & Infrastructure",
                items: [
                  "Rate-limited, hardened auth routes (IP + per-account)",
                  "Redis (Upstash) data modeling & telemetry aggregation",
                  "Cloud job processing with polling & timeout guards",
                  "CORS-locked API design across Vercel deployments",
                ],
              },
              {
                title: "Frontend Engineering",
                items: [
                  "Next.js App Router with conditional shell & auth guard",
                  "Zustand state management + localStorage hydration",
                  "Floating detachable chat window (drag + screenshot)",
                  "Live telemetry dashboard with real-time stat pulls",
                ],
              },
            ].map((group) => (
              <div key={group.title}>
                <h3 className="font-semibold text-black dark:text-white mb-3">{group.title}</h3>
                <ul className="space-y-1.5">
                  {group.items.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="text-violet-400 mt-0.5 shrink-0">▸</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* FOOTER CTA */}
      <Section delay={440}>
        <div className="mt-14 p-6 rounded-2xl bg-gradient-to-r from-violet-500/10 via-blue-500/10 to-cyan-500/10 border border-violet-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-base">Want to see it live?</p>
            <p className="text-zinc-500 text-sm mt-1">Check the real-time telemetry dashboard or explore the backend API.</p>
          </div>
          <div className="flex gap-3 shrink-0">
            <a
              href="https://sammyos-live.vercel.app/"
              target="_blank"
              className="px-5 py-2.5 rounded-full bg-black text-white dark:bg-white dark:text-black text-sm font-medium hover:scale-105 transition-transform"
            >
              Live Dashboard →
            </a>
            <a
              href="https://nexus-analyzer-three.vercel.app/"
              target="_blank"
              className="px-5 py-2.5 rounded-full border border-zinc-300 dark:border-zinc-600 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              Nexus API →
            </a>
          </div>
        </div>
      </Section>

    </main>
  );
}