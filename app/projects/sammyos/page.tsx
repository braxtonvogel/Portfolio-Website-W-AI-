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
    title: "Screen Awareness",
    stat: "< 100ms capture latency",
    headline: "Sam sees exactly what you see — instantly.",
    desc: "A Rust Tauri command captures the active window on demand and ships the pixel data to the AI context. No manual screenshots, no copy-paste. Ask Sam \"what's wrong with this error?\" and it already knows — it's looking at your screen.",
    how: "Rust screenshot command → base64 encode → injected as vision input into the LLM payload alongside your text prompt.",
    tags: ["Tauri v2", "Rust", "Vision API", "Active Window Detection"],
  },
  {
    title: "Live Audio Transcription",
    stat: "Real-time streaming transcript",
    headline: "Every word in your meeting becomes AI context.",
    desc: "SammyOS taps your microphone or system audio and streams a live rolling transcript directly into Sam's context window. Ask follow-up questions mid-meeting without stopping to type. Sam heard it too.",
    how: "Web Audio API → chunked PCM → Whisper transcription → appended to chat context on each utterance boundary.",
    tags: ["Web Audio API", "Whisper", "Streaming", "Real-time"],
  },
  {
    title: "File & Codebase Reading",
    stat: "Entire repo trees supported",
    headline: "Drop a codebase. Sam reads every file.",
    desc: "Upload individual files or entire directory trees. Sam parses the structure, indexes relationships between files, and answers questions spanning the full codebase — not just the file you happened to open.",
    how: "Drag-drop upload → recursive file tree flattening → chunked context injection with path metadata preserved per file.",
    tags: ["Next.js API Routes", "File System API", "Context Chunking"],
  },
  {
    title: "Autonomous Deep Research",
    stat: "Multi-step · Auto-saved reports",
    headline: "Kick it off. Come back to a finished report.",
    desc: "Describe a research question and Sam takes over — breaking it into sub-queries, searching across sources, cross-referencing results, and synthesizing a structured report. The finished report auto-saves to your Knowledge Vault without you lifting a finger.",
    how: "Research job queued in Redis → polling loop (max 60 attempts, 5s intervals) → multi-step LLM chain → vault write on completion.",
    tags: ["Redis Job Queue", "LLM Chaining", "Upstash", "Polling"],
  },
  {
    title: "Knowledge Vault",
    stat: "Persistent · Searchable · Cloud-synced",
    headline: "Every insight Sam finds, saved forever.",
    desc: "Research reports, uploaded analyses, and key findings are persisted to a personal cloud vault backed by Redis on Upstash. Each upload increments a live counter piped to the public telemetry dashboard — so your productivity is literally measurable.",
    how: "VaultUpload component → POST /api/vault/ping on nexus-analyzer → Redis INCR on `telemetry:total:vault_upload` → live count on sammyos-live.",
    tags: ["Upstash Redis", "CORS", "REST API", "Telemetry"],
  },
  {
    title: "Bring Your Own Key",
    stat: "5-provider fallback chain",
    headline: "Your API key. Your priority. Zero wasted tokens.",
    desc: "Store your OpenAI, Anthropic, Groq, or any OpenAI-compatible key in your account. It gets inserted first in the provider chain — meaning you get faster models and no rate-sharing with other users. If your key is missing, the free rotation kicks in automatically.",
    how: "Settings page → key stored encrypted in nexus-analyzer → key-injection.ts fetches on each chat request → Custom → Ollama → Groq → Gemini → Cerebras.",
    tags: ["JWT", "Key Injection", "Provider Routing", "Fallback Logic"],
  },
  {
    title: "Hardened Auth",
    stat: "10 attempts / IP / 15 min",
    headline: "Production-grade security, not tutorial auth.",
    desc: "Login and register routes enforce per-IP and per-account rate limits. Passwords are bcrypt-hashed server-side, sessions are JWT-signed, and every cross-origin request is validated against an allowlist. The auth layer was built to survive real abuse — not just a demo.",
    how: "Upstash rate-limit middleware → bcrypt hash on register → JWT sign → x-sammy-token header forwarded on all subsequent API calls.",
    tags: ["bcrypt", "JWT", "Rate Limiting", "CORS", "Upstash"],
  },
  {
    title: "Silent One-Click Launcher",
    stat: "0 terminal windows on launch",
    headline: "Double-click. App opens. Nothing else.",
    desc: "SammyOS.vbs triggers launch.py which validates Node, npm, Rust, and Tauri-CLI, pulls any GitHub updates, then fires the app via Task Scheduler — all without a single terminal window appearing. A self-deleting helper prevents double-launch, and a log file captures every run.",
    how: "SammyOS.vbs → wscript (silent) → launch.py → launcher_helper.vbs (Task Scheduler) → self-deletes task after fire → launcher.log written.",
    tags: ["VBScript", "Python", "Task Scheduler", "GitHub API", "wmic"],
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

const TABS = [
  {
    id: "chat",
    label: "Chat",
    src: "/sammyos-chat.png",
    alt: "SammyOS Chat Tab",
    headline: "Talk to Sam — with full context awareness.",
    desc: "The main chat interface where you talk to Sam. Unlike a regular chatbot, Sam has simultaneous access to whatever is on your screen, any files you've uploaded, and your live meeting audio — all surfaced in a single conversation thread. Chat history is persisted across sessions and browseable from the sidebar panel.",
    tip: "Try asking Sam to explain what's on your screen while also referencing a file you uploaded. It handles both at once.",
  },
  {
    id: "vault",
    label: "Vault",
    src: "/sammyos-vault.png",
    alt: "SammyOS Knowledge Vault",
    headline: "Every insight Sam produces, saved and searchable.",
    desc: "The Knowledge Vault stores every research report and file analysis Sam has ever produced for your account. Reports are cloud-persisted via Redis on Upstash and tied to your user session. Each upload pings a telemetry counter that feeds the live public dashboard at sammyos-live.vercel.app — so your vault activity is literally measurable in real time.",
    tip: "Upload a codebase or PDF here to make it permanently available to Sam in any future chat session.",
  },
  {
    id: "workspace",
    label: "Workspace",
    src: "/sammyos-workspace.png",
    alt: "SammyOS Workspace Tab",
    headline: "Drop in a file. Drop in a whole codebase.",
    desc: "The Workspace tab is your upload hub. Drag in individual files or entire folder trees and Sam will parse the structure, index relationships between files, and make the full content available to every subsequent chat message. File paths and metadata are preserved so Sam always knows which file a line of code came from.",
    tip: "Uploading a Next.js project? Sam will understand the App Router structure and answer questions spanning multiple files.",
  },
  {
    id: "research",
    label: "Research",
    src: "/sammyos-research.png",
    alt: "SammyOS Research Tab",
    headline: "Set a research question. Get back a finished report.",
    desc: "The Research tab lets you kick off an autonomous multi-step research job. Sam breaks your question into sub-queries, searches across sources, cross-references results, and compiles everything into a structured report — then automatically saves it to your Knowledge Vault when done. A polling loop with a 5-minute timeout keeps you informed of job status without hanging the UI.",
    tip: "Research jobs run in the background. You can keep chatting while Sam works.",
  },
  {
    id: "float",
    label: "Float Window",
    src: "/sammyos-float.png",
    alt: "SammyOS Floating Chat Window",
    headline: "Sam on top — without switching apps.",
    desc: "The floating chat window is a detachable, always-on-top panel you can drag anywhere on your screen. It runs as a separate Tauri webview window with its own auth hydration and can capture a screenshot of whatever is currently visible behind it. Perfect for asking Sam about content in another app without losing your place.",
    tip: "Click the screenshot button in the float window to instantly send Sam a capture of your current screen.",
  },
  {
    id: "settings",
    label: "Settings",
    src: "/sammyos-settings.png",
    alt: "SammyOS Settings Tab",
    headline: "Your keys. Your models. Your priority.",
    desc: "The Settings tab lets you store your own API keys for OpenAI, Anthropic, Groq, or any OpenAI-compatible endpoint. Your key is injected first into the provider chain on every request — giving you access to faster models, higher rate limits, and no token-sharing with other users. If your key is absent, SammyOS silently falls back to the free rotation.",
    tip: "Adding a Groq key alone unlocks Llama 3 70B at near-instant speeds for free.",
  },
];

function ScreenshotBrowser() {
  const [active, setActive] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [displayIndex, setDisplayIndex] = useState(0);

  const switchTo = (i: number) => {
    if (i === active || animating) return;
    setAnimating(true);
    setTimeout(() => {
      setDisplayIndex(i);
      setActive(i);
      setAnimating(false);
    }, 180);
  };

  const tab = TABS[displayIndex];

  return (
    <div className="mt-14">
      <h2 className="text-2xl font-semibold mb-6">App Interface</h2>

      {/* TAB STRIP */}
      <div className="flex gap-1.5 flex-wrap mb-4">
        {TABS.map((t, i) => (
          <button
            key={t.id}
            onClick={() => switchTo(i)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
              active === i
                ? "bg-black text-white dark:bg-white dark:text-black"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* SCREENSHOT */}
      <div
        className={`transition-opacity duration-180 ${animating ? "opacity-0" : "opacity-100"}`}
      >
        <div className="relative rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-zinc-950">
          {/* fake window chrome */}
          <div className="flex items-center gap-1.5 px-4 py-3 bg-zinc-900 border-b border-zinc-800">
            <span className="w-3 h-3 rounded-full bg-red-500/70" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
            <span className="w-3 h-3 rounded-full bg-green-500/70" />
            <span className="ml-3 text-[11px] font-mono text-zinc-500">SammyOS — {tab.label}</span>
          </div>
          <Image
            src={tab.src}
            alt={tab.alt}
            width={1280}
            height={800}
            className="w-full object-cover"
            priority
          />
        </div>

        {/* DESCRIPTION PANEL */}
        <div className="mt-4 rounded-2xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
            <span className="font-semibold">{tab.label} Tab</span>
          </div>
          <div className="px-6 py-5 bg-white dark:bg-zinc-950 grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-2">
              <p className="font-semibold text-base text-black dark:text-white">{tab.headline}</p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-7">{tab.desc}</p>
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-2">Pro tip</p>
              <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3">
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-6 italic">"{tab.tip}"</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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
          Back to Home
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
              Backup Video
            </button>
          </div>
          <div className="aspect-video bg-zinc-900 rounded-2xl border border-zinc-800 flex items-center justify-center">
            <iframe
              src="https://www.youtube.com/embed/wqK-W5ITnnM"
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
              x
            </button>
            <iframe src="https://drive.google.com/file/d/1KzIQ40AvLx2AmNKKUZ1Bcran3ZJLiHSv/preview" className="w-full h-[500px] rounded-xl" allow="autoplay" />
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

          {/* GRID OF BUTTONS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
            {FEATURES.map((f, i) => (
              <button
                key={i}
                onClick={() => setActiveFeature(i)}
                className={`text-left p-4 rounded-xl border transition-all duration-200 group ${
                  activeFeature === i
                    ? "border-violet-500 bg-violet-500/10"
                    : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500"
                }`}
              >
                <p className={`text-xs font-semibold leading-snug ${
                  activeFeature === i ? "text-violet-400" : "text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200"
                }`}>
                  {f.title}
                </p>
              </button>
            ))}
          </div>

          {/* RICH DETAIL PANEL */}
          <div className="mt-3 rounded-2xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">

            {/* TOP BAR */}
            <div className="flex items-center justify-between px-6 py-4 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-base">{FEATURES[activeFeature].title}</span>
              </div>
              <span className="text-xs font-mono text-violet-400 bg-violet-500/10 border border-violet-500/20 px-3 py-1 rounded-full">
                {FEATURES[activeFeature].stat}
              </span>
            </div>

            {/* BODY */}
            <div className="p-6 bg-white dark:bg-zinc-950 grid md:grid-cols-5 gap-6">

              {/* LEFT: headline + description */}
              <div className="md:col-span-3 space-y-3">
                <p className="text-lg font-semibold leading-snug text-black dark:text-white">
                  {FEATURES[activeFeature].headline}
                </p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-7">
                  {FEATURES[activeFeature].desc}
                </p>
              </div>

              {/* RIGHT: how it works + tech tags */}
              <div className="md:col-span-2 space-y-4">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-2">How it works</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono leading-6 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3">
                    {FEATURES[activeFeature].how}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-2">Tech involved</p>
                  <div className="flex flex-wrap gap-1.5">
                    {FEATURES[activeFeature].tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 font-mono"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </Section>

      {/* SCREENSHOT BROWSER */}
      <Section delay={270}>
        <ScreenshotBrowser />
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
              Live Dashboard
            </a>
            <a
              href="https://nexus-analyzer-three.vercel.app/"
              target="_blank"
              className="px-5 py-2.5 rounded-full border border-zinc-300 dark:border-zinc-600 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              Nexus API
            </a>
          </div>
        </div>
      </Section>

    </main>
  );
}