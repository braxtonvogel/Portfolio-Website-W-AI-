"use client";

import Link from "next/link";
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

export default function ChatServerProject() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showBackup, setShowBackup] = useState(false);

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

      {/* ================= PROGRESS BAR ================= */}
      <div className="fixed top-0 left-0 w-full h-1 bg-zinc-200 dark:bg-zinc-800 z-50">
        <div
          className="h-full bg-black dark:bg-white transition-all"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* ================= BACK ================= */}
      <Section>
        <Link
          href="/"
          className="text-sm text-zinc-400 hover:text-white transition-colors duration-200"
        >
          ← Back to Home
        </Link>
      </Section>

      {/* ================= TITLE ================= */}
      <Section delay={50}>
        <h1 className="text-4xl font-bold mt-6">Chat Server</h1>
        <p className="text-zinc-500 mt-2">
          Java • Sockets • Networking • Client-Server Architecture
        </p>
      </Section>

      {/* ================= GITHUB ================= */}
      <Section delay={100}>
        <a
          href="https://github.com/braxtonvogel/Chatroom-Project---First-Major-Project---Braxton-Vogel-2025"
          target="_blank"
          className="inline-block mt-6 px-5 py-2 rounded-full bg-black text-white dark:bg-white dark:text-black hover:scale-105 transition"
        >
          View GitHub Repository
        </a>
      </Section>

      {/* ================= VIDEO ================= */}
      <Section delay={150}>
        <div className="mt-10">

          {/* HEADER ROW */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">
              Project Walkthrough
            </h2>

            <button
              onClick={() => setShowBackup(true)}
              className="px-4 py-1.5 text-sm border border-white rounded-full
                         hover:bg-white hover:text-black transition"
            >
              Backup Video
            </button>
          </div>

          {/* YOUTUBE VIDEO */}
          <div className="w-full aspect-video">
            <iframe
              className="w-full h-full rounded-xl border"
              src="https://www.youtube.com/embed/8oULMMghP2Y"
              title="Chat Server Walkthrough"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      </Section>

      {/* ================= OVERVIEW ================= */}
      <Section delay={200}>
        <h2 className="text-2xl font-semibold mt-10">Overview</h2>
        <p className="text-zinc-600 dark:text-zinc-300 leading-7 mt-3">
          This is my first major software project completed at Sam Houston State University.
          It is a basic real-time chatroom system built in Java using socket programming.
        </p>
        <p className="text-zinc-600 dark:text-zinc-300 leading-7 mt-4">
          The system allows users to either join existing chat rooms or create new ones
          that others can join, forming a simple but functional multiplayer messaging environment.
        </p>
      </Section>

      {/* ================= FEATURES ================= */}
      <Section delay={250}>
        <h2 className="text-2xl font-semibold mt-10 mb-6">
          Key Features
        </h2>
        <ul className="list-disc pl-6 space-y-3 text-zinc-600 dark:text-zinc-300">
          <li>Real-time messaging using Java sockets</li>
          <li>Lobby system for managing chat groups</li>
          <li>Create new chat rooms dynamically</li>
          <li>Join existing public chat rooms</li>
          <li>Multi-client communication support</li>
        </ul>
      </Section>

      {/* ================= USE CASES ================= */}
      <Section delay={300}>
        <h2 className="text-2xl font-semibold mt-10">Use Cases</h2>
        <p className="text-zinc-600 dark:text-zinc-300 mt-3 leading-7">
          This project demonstrates how basic networking concepts can be used to build
          real-time communication systems. It can be extended into group messaging apps,
          multiplayer game lobbies, classroom discussion tools, or private chat systems.
        </p>
      </Section>

      {/* ================= CHALLENGES ================= */}
      <Section delay={350}>
        <h2 className="text-2xl font-semibold mt-10">
          Challenges & What I Learned
        </h2>
        <p className="text-zinc-600 dark:text-zinc-300 mt-3 leading-7">
          The biggest challenge was managing multiple clients at the same time while
          keeping message delivery stable and synchronized across all connected users.
        </p>
        <p className="text-zinc-600 dark:text-zinc-300 mt-4 leading-7">
          Through this project, I learned how socket programming works in Java, how servers
          handle multiple connections, and how real-time communication systems are structured.
        </p>
      </Section>

      {/* ================= SKILLS ================= */}
      <Section delay={400}>
        <div className="mt-12 border-t pt-10">
          <h2 className="text-2xl font-semibold mb-4">
            Skills Gained
          </h2>

          <div className="grid sm:grid-cols-2 gap-4 text-zinc-600 dark:text-zinc-300">
            <ul className="list-disc pl-6 space-y-2">
              <li>Java development</li>
              <li>Socket programming</li>
              <li>Client-server architecture</li>
              <li>Real-time messaging systems</li>
              <li>Network communication design</li>
            </ul>

            <ul className="list-disc pl-6 space-y-2">
              <li>Multi-client handling</li>
              <li>System debugging</li>
              <li>Project structuring</li>
              <li>Command-line application design</li>
              <li>Backend engineering fundamentals</li>
            </ul>
          </div>
        </div>
      </Section>

      {/* ================= BACKUP VIDEO MODAL ================= */}
      {showBackup && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={() => setShowBackup(false)}
        >
          <div
            className="w-[90%] max-w-4xl aspect-video bg-black border border-white rounded-xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* CLOSE */}
            <button
              onClick={() => setShowBackup(false)}
              className="absolute top-2 right-3 text-white text-2xl font-bold hover:scale-110"
            >
              ✕
            </button>

            {/* GOOGLE DRIVE EMBED */}
            <iframe
              className="w-full h-full rounded-xl"
              src="https://drive.google.com/file/d/1WhmkSB37i8xvEIMMokmv2BgXHd3kxDQ4/preview"
              allow="autoplay"
            />
          </div>
        </div>
      )}
    </main>
  );
}

/* ================= METADATA ================= */
export const projectMeta = {
  title: "Chat Server",
  type: "Personal Project",
  tech: "Java • Sockets • Networking • Client-Server Architecture",
  skills: [
    "Java development",
    "Socket programming",
    "Client-server architecture",
    "Real-time messaging systems",
    "Network communication design",
    "Multi-client handling",
    "System debugging",
    "Project structuring",
    "Command-line application design",
    "Backend engineering fundamentals",
  ],
};