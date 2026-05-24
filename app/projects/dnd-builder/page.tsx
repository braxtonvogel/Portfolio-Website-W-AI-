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

export default function DnDProject() {
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
      {/* PROGRESS BAR */}
      <div className="fixed top-0 left-0 w-full h-1 bg-zinc-200 dark:bg-zinc-800 z-50">
        <div
          className="h-full bg-black dark:bg-white transition-all"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* BACK (FIXED) */}
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
          Dungeons & Dragons Character Builder Database System
        </h1>
        <p className="text-zinc-500 mt-2">
          Python • Spring Boot • SQL • Full Stack System
        </p>
      </Section>

      {/* GITHUB */}
      <Section delay={100}>
        <a
          href="https://github.com/braxtonvogel/D-D-Character-Builder-Database-System-"
          target="_blank"
          className="inline-block mt-6 px-5 py-2 rounded-full bg-black text-white dark:bg-white dark:text-black hover:scale-105 transition"
        >
          View GitHub Repository
        </a>
      </Section>

      {/* PDF */}
      <Section delay={150}>
        <div className="mt-10">
          <h2 className="text-2xl font-semibold mb-4">Documentation</h2>
          <iframe
            src="https://drive.google.com/file/d/1aOFYDRoRwtkIy_W1c7FxS1ZeY8z8l72N/preview"
            className="w-full h-[600px] rounded-xl border"
          />
        </div>
      </Section>

      {/* OVERVIEW */}
      <Section delay={200}>
        <h2 className="text-2xl font-semibold mt-10">Overview</h2>
        <p className="text-zinc-600 dark:text-zinc-300 leading-7 mt-3">
          This is a full-stack database system for creating and managing Dungeons &
          Dragons characters using structured relational design and Spring Boot backend.
        </p>
      </Section>

      {/* SIDE BY SIDE VISUALS */}
      <Section delay={250}>
        <h2 className="text-2xl font-semibold mt-10 mb-6">
          System Design & Interface
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg mb-2">Crow’s Foot ERD</h3>
            <Image
              src="/dnd-er-diagram.png"
              alt="Crow’s Foot ERD"
              width={900}
              height={600}
              className="rounded-xl border"
            />
          </div>
          <div>
            <h3 className="text-lg mb-2">
              Conceptual Entity-Relationship Diagram (Conceptual ERD)
            </h3>
            <Image
              src="/dnd-gui-screenshot.png"
              alt="UI Screenshot"
              width={900}
              height={600}
              className="rounded-xl border"
            />
          </div>
        </div>
      </Section>

      {/* CHALLENGES */}
      <Section delay={300}>
        <h2 className="text-2xl font-semibold mt-10">
          Challenges & What I Learned
        </h2>
        <p className="text-zinc-600 dark:text-zinc-300 mt-3 leading-7">
          Designing normalized relational databases and managing many-to-many
          relationships was the most complex part of this project. I also learned how
          backend architecture connects with frontend templates using Spring Boot MVC.
        </p>
      </Section>

      {/* SKILLS */}
      <Section delay={350}>
        <div className="mt-12 border-t pt-10">
          <h2 className="text-2xl font-semibold mb-4">Skills Gained</h2>
          <div className="grid sm:grid-cols-2 gap-4 text-zinc-600 dark:text-zinc-300">
            <ul className="list-disc pl-6 space-y-2">
              <li>SQL database design</li>
              <li>Spring Boot backend</li>
              <li>Python development</li>
              <li>Relational modeling</li>
              <li>MVC architecture</li>
            </ul>
            <ul className="list-disc pl-6 space-y-2">
              <li>Full-stack integration</li>
              <li>GitHub workflow</li>
              <li>System debugging</li>
              <li>Security testing basics</li>
              <li>Software documentation</li>
            </ul>
          </div>
        </div>
      </Section>
    </main>
  );
}


/* ================= PROJECT METADATA (FOR FAKE AI SYSTEM) ================= */

export const projectMeta = {
  title: "D&D Character Builder",
  type: "Group Project",
  tech: "Python • Spring Boot • SQL • Database Design",
  skills: [
    "Python development",
    "Java (Spring Boot backend)",
    "SQL database design",
    "Relational database modeling",
    "CRUD operations",
    "Client-server architecture",
    "Backend API design",
    "Data modeling",
    "System integration",
    "Team collaboration",
    "Software design patterns",
    "Debugging backend systems",
  ],
};