"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

function Section({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`transition-all duration-700 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      {children}
    </div>
  );
}

export default function SammyOSProject() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [backupOpen, setBackupOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main className="max-w-5xl mx-auto px-6 py-16 text-black dark:text-white">

      {/* PROGRESS BAR */}
      <div className="fixed top-0 left-0 w-full h-1 bg-zinc-200 dark:bg-zinc-800 z-50">
        <div
          className="h-full bg-black dark:bg-white transition-all"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* BACK */}
      <Section>
        <Link
          href="/"
          className="text-sm text-zinc-400 hover:text-white transition-colors duration-200"
        >
          ← Back to Home
        </Link>
      </Section>

      {/* TITLE */}
      <Section delay={50}>
        <h1 className="text-4xl font-bold mt-6">
          SammyOS — Native Desktop AI Workspace
        </h1>
        <p className="text-zinc-500 mt-2">
          Tauri • Next.js • Rust • Zustand • Redis (Upstash) • Multi-LLM Routing
        </p>
      </Section>

      {/* GITHUB */}
      <Section delay={100}>
        <a
          href="https://github.com/braxtonvogel/SammyOS-AI-Workspace"
          target="_blank"
          className="inline-block mt-6 px-5 py-2 rounded-full bg-black text-white dark:bg-white dark:text-black hover:scale-105 transition"
        >
          View GitHub Repository
        </a>
      </Section>

      {/* VIDEO + BACKUP BUTTON */}
      <Section delay={150}>
        <div className="mt-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">
              Project Walkthrough
            </h2>

            <button
              onClick={() => setBackupOpen(true)}
              className="px-4 py-1 text-sm border rounded-full hover:bg-black hover:text-white transition"
            >
              Backup Video
            </button>
          </div>

          {/* YOUTUBE VIDEO - placeholder, add embed URL when ready */}
          <div className="aspect-video">
            <iframe
              src=""
              className="w-full h-full rounded-xl border"
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          </div>
        </div>
      </Section>

      {/* BACKUP MODAL */}
      {backupOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-black border border-white rounded-xl w-[90%] max-w-4xl p-4 relative">
            <button
              onClick={() => setBackupOpen(false)}
              className="absolute top-2 right-3 text-white text-xl"
            >
              ✕
            </button>

            {/* placeholder, add Google Drive preview URL when ready */}
            <iframe
              src=""
              className="w-full h-[500px] rounded-lg"
              allow="autoplay"
            />
          </div>
        </div>
      )}

      {/* OVERVIEW */}
      <Section delay={200}>
        <h2 className="text-2xl font-semibold mt-10">Overview</h2>

        <p className="text-zinc-600 dark:text-zinc-300 leading-7 mt-3">
          SammyOS is a native desktop AI workspace built with Tauri and Next.js, running as a real Windows desktop application rather than a web app. The central AI assistant, Sam, can simultaneously see your screen, hear your voice or meeting audio, read uploaded files or entire codebases, and conduct deep autonomous AI research.
        </p>

        <p className="text-zinc-600 dark:text-zinc-300 leading-7 mt-4">
          Research reports are automatically saved to a Knowledge Vault. Users authenticate with accounts and can optionally store their own API keys (OpenAI, Anthropic, Groq, or any OpenAI-compatible endpoint) for priority routing, with automatic fallback to a free rotation of providers.
        </p>
      </Section>

      {/* VISUALS */}
      <Section delay={250}>
        <h2 className="text-2xl font-semibold mt-10 mb-6">
          Interface & Architecture
        </h2>

        <div className="grid md:grid-cols-2 gap-6">

          <div>
            <h3 className="text-lg mb-2">Desktop App Interface</h3>
            <Image
              src="/sammyos_interface.png"
              alt="SammyOS Desktop App"
              width={900}
              height={600}
              className="rounded-xl border"
            />
          </div>

          <div>
            <h3 className="text-lg mb-2">Live Dashboard</h3>
            <Image
              src="/sammyos_dashboard.png"
              alt="SammyOS Live Dashboard"
              width={900}
              height={600}
              className="rounded-xl border"
            />
          </div>

        </div>
      </Section>

      {/* PROJECT STRUCTURE */}
      <Section delay={280}>
        <h2 className="text-2xl font-semibold mt-10 mb-4">
          Project Structure
        </h2>

        <pre className="text-xs bg-zinc-900 text-zinc-200 p-4 rounded-xl overflow-x-auto border">
{`SammyOS/
│
├── SammyOS.vbs              ← double-click launcher
├── launch.py                ← launcher logic
│
├── apps/
│   └── desktop/              ← Main Tauri + Next.js app
│       ├── src-tauri/
│       │   └── src/
│       │       └── main.rs   ← Rust backend (Tauri commands)
│       ├── app/
│       │   ├── login/
│       │   ├── chat/
│       │   ├── vault/
│       │   ├── workspace/
│       │   ├── research/
│       │   ├── settings/
│       │   ├── chat-float/
│       │   └── api/
│       │       ├── chat/
│       │       ├── vault/
│       │       ├── research/
│       │       └── settings/
│       └── components/
│           ├── layout/
│           └── chat/
│
├── requirements / package.json
└── .gitignore`}
        </pre>
      </Section>

      {/* HOW TO RUN */}
      <Section delay={320}>
        <h2 className="text-2xl font-semibold mt-10">
          How to Run the Project
        </h2>

        <div className="mt-4 space-y-4 text-zinc-600 dark:text-zinc-300">

          <p><b>1. Clone repository</b></p>
          <pre className="bg-zinc-900 text-zinc-200 p-3 rounded-xl">
git clone https://github.com/braxtonvogel/SammyOS-AI-Workspace.git
cd SammyOS-AI-Workspace
          </pre>

          <p><b>2. Install dependencies</b></p>
          <pre className="bg-zinc-900 text-zinc-200 p-3 rounded-xl">
cd apps/desktop
npm install
          </pre>

          <p><b>3. Run the desktop app (Tauri)</b></p>
          <pre className="bg-zinc-900 text-zinc-200 p-3 rounded-xl">
npm run tauri dev
          </pre>

          <p><b>4. Or launch via the silent launcher (Windows)</b></p>
          <p>Double-click <code>SammyOS.vbs</code> from the repo root.</p>
        </div>
      </Section>

      {/* KEY FEATURES */}
      <Section delay={360}>
        <h2 className="text-2xl font-semibold mt-10">Key Features</h2>

        <ul className="list-disc pl-6 space-y-2 text-zinc-600 dark:text-zinc-300 mt-3">
          <li>Native desktop AI workspace (Tauri + Next.js)</li>
          <li>Sam: AI assistant with screen, audio, and file/codebase awareness</li>
          <li>Autonomous deep research with auto-saved Knowledge Vault reports</li>
          <li>Multi-provider LLM routing with user-supplied API key support</li>
          <li>Full authentication system with rate-limited, hardened auth routes</li>
          <li>Live telemetry dashboard (sammyos-live.vercel.app)</li>
          <li>Silent one-click launcher with auto-update from GitHub</li>
        </ul>
      </Section>

      {/* SKILLS GAINED */}
      <Section delay={400}>
        <div className="mt-12 border-t pt-10">
          <h2 className="text-2xl font-semibold">Skills Gained</h2>

          <div className="grid sm:grid-cols-2 gap-6 mt-4 text-zinc-600 dark:text-zinc-300">

            <div>
              <h3 className="font-semibold mb-2">Desktop App Development</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Tauri + Rust native backend integration</li>
                <li>Screen capture & active window detection</li>
                <li>Cross-platform app packaging and launching</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">AI & Systems Integration</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Multi-LLM provider routing with fallback logic</li>
                <li>Real-time audio transcription</li>
                <li>Autonomous AI research pipelines</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Backend & Infrastructure</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Authentication, rate limiting, and security hardening</li>
                <li>Redis (Upstash) data modeling</li>
                <li>Cloud job processing pipelines</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Web Development</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Next.js App Router architecture</li>
                <li>Zustand state management</li>
                <li>Live telemetry dashboards</li>
              </ul>
            </div>

          </div>
        </div>
      </Section>

    </main>
  );
}