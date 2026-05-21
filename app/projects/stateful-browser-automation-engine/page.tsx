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

export default function StatefulBrowserAutomationProject() {
  const [scrollProgress, setScrollProgress] = useState(0);

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

      {/* ================= BACK BUTTON ================= */}
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
        <h1 className="text-4xl font-bold mt-6">
          Stateful Browser Automation Engine
        </h1>

        <p className="text-zinc-500 mt-2">
          Python • Playwright • Chromium • Session Automation
        </p>
      </Section>

      {/* ================= GITHUB ================= */}
      <Section delay={100}>
        <a
          href="https://github.com/braxtonvogel/Stateful-Browser-Automation-Engine/tree/main"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-6 px-5 py-2 rounded-full bg-black text-white dark:bg-white dark:text-black hover:scale-105 transition"
        >
          View GitHub Repository
        </a>
      </Section>

      {/* ================= IMAGES ================= */}
      <Section delay={150}>
        <h2 className="text-2xl font-semibold mt-10 mb-6">
          Automation Workflow
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg mb-2">
              Automated Navigation in Action
            </h3>

            <Image
              src="/in_action.png"
              alt="Automation Running"
              width={900}
              height={600}
              className="rounded-xl border"
            />
          </div>

          <div>
            <h3 className="text-lg mb-2">
              Persistent Login Setup
            </h3>

            <Image
              src="/finished.png"
              alt="Login Setup"
              width={900}
              height={600}
              className="rounded-xl border"
            />
          </div>
        </div>
      </Section>

      {/* ================= OVERVIEW ================= */}
      <Section delay={200}>
        <h2 className="text-2xl font-semibold mt-10">
          Overview
        </h2>

        <p className="text-zinc-600 dark:text-zinc-300 leading-7 mt-3">
          This project is a lightweight Python automation framework built
          with Playwright for managing persistent, authenticated browser
          sessions and automating web workflows.
        </p>

        <p className="text-zinc-600 dark:text-zinc-300 leading-7 mt-4">
          The system demonstrates how browser automation can maintain
          persistent login sessions across runs, automate navigation tasks,
          reuse authenticated browser contexts, and interact with dynamic
          web applications using Chromium automation.
        </p>

        <p className="text-zinc-600 dark:text-zinc-300 leading-7 mt-4">
          It was designed as a reusable foundation for building more
          advanced browser automation systems and workflow tools.
        </p>
      </Section>

      {/* ================= FEATURES ================= */}
      <Section delay={250}>
        <h2 className="text-2xl font-semibold mt-10 mb-6">
          Key Features
        </h2>

        <div className="grid md:grid-cols-2 gap-6 text-zinc-600 dark:text-zinc-300">
          <ul className="list-disc pl-6 space-y-3">
            <li>Persistent authentication using saved browser state</li>
            <li>Automated browser navigation workflows</li>
            <li>Fast session reuse without repeated login</li>
            <li>Stateful browser context management</li>
          </ul>

          <ul className="list-disc pl-6 space-y-3">
            <li>Built with Playwright and Chromium automation</li>
            <li>Dynamic web interaction support</li>
            <li>Reusable automation workflow structure</li>
            <li>Scalable automation system foundation</li>
          </ul>
        </div>
      </Section>

      {/* ================= USE CASES ================= */}
      <Section delay={300}>
        <h2 className="text-2xl font-semibold mt-10">
          Use Case Examples
        </h2>

        <p className="text-zinc-600 dark:text-zinc-300 mt-3 leading-7">
          This automation engine can be adapted for dashboard automation,
          authenticated workflow management, navigating member-only systems,
          repetitive browser tasks requiring login state persistence, and
          data collection from session-based websites where permitted.
        </p>
      </Section>

      {/* ================= PROJECT STRUCTURE ================= */}
      <Section delay={350}>
        <h2 className="text-2xl font-semibold mt-10">
          Project Structure
        </h2>

        <div className="mt-4 rounded-xl border p-6 bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 overflow-x-auto">
          <pre className="whitespace-pre-wrap text-sm">
{`Stateful-Browser-Automation-Engine/
│
├── main.py
├── requirements.txt
├── README.md
├── screenshots/
│   ├── finished.png
│   └── in_action.png
└── .gitignore`}
          </pre>
        </div>
      </Section>

      {/* ================= CHALLENGES ================= */}
      <Section delay={400}>
        <h2 className="text-2xl font-semibold mt-10">
          Challenges & What I Learned
        </h2>

        <p className="text-zinc-600 dark:text-zinc-300 mt-3 leading-7">
          One of the biggest challenges was designing a reliable session
          persistence system that could maintain authenticated browser
          states across multiple runs without requiring repeated logins.
        </p>

        <p className="text-zinc-600 dark:text-zinc-300 mt-4 leading-7">
          Through this project, I learned how browser automation systems
          manage state, interact with dynamic web applications, structure
          reusable workflows, and automate Chromium browser interactions
          using Playwright.
        </p>
      </Section>

      {/* ================= SKILLS ================= */}
      <Section delay={450}>
        <div className="mt-12 border-t pt-10">
          <h2 className="text-2xl font-semibold mb-4">
            Skills Gained
          </h2>

          <div className="grid sm:grid-cols-2 gap-4 text-zinc-600 dark:text-zinc-300">
            <ul className="list-disc pl-6 space-y-2">
              <li>Python automation development</li>
              <li>Playwright browser automation</li>
              <li>Persistent session management</li>
              <li>Dynamic web interaction</li>
              <li>Automation workflow design</li>
            </ul>

            <ul className="list-disc pl-6 space-y-2">
              <li>Chromium automation architecture</li>
              <li>Stateful authentication systems</li>
              <li>Browser workflow debugging</li>
              <li>Reusable software design</li>
              <li>GitHub project management</li>
            </ul>
          </div>
        </div>
      </Section>
    </main>
  );
}


/* ================= PROJECT METADATA (FOR FAKE AI SYSTEM) ================= */

export const projectMeta = {
  title: "Stateful Browser Automation Engine",
  type: "Personal Project",
  tech: "Python • Playwright • Chromium • Session Automation",
  skills: [
    "Python automation development",
    "Playwright browser automation",
    "Stateful session management",
    "Persistent authentication systems",
    "Dynamic web interaction",
    "Chromium automation architecture",
    "Automation workflow design",
    "Browser control scripting",
    "System debugging",
    "Reusable software design",
    "GitHub project management",
  ],
};