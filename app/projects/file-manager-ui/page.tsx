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

export default function FileManagerProject() {
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
        <h1 className="text-4xl font-bold mt-6">File Manager UI</h1>
        <p className="text-zinc-500 mt-2">
          HTML • React • UI/UX • Frontend Design • Workflow Optimization
        </p>
      </Section>

      {/* GITHUB */}
      <Section delay={100}>
        <a
          href="https://github.com/braxtonvogel/File-Manager-UI-Prototype"
          target="_blank"
          className="inline-block mt-6 px-5 py-2 rounded-full bg-black text-white dark:bg-white dark:text-black hover:scale-105 transition"
        >
          View GitHub Repository
        </a>
      </Section>

      {/* ================= VIDEO ================= */}
      <Section delay={150}>
        <div className="mt-10">

          {/* HEADER */}
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

          {/* PRIMARY VIDEO (YouTube NOW) */}
          <div className="w-full aspect-video">
            <iframe
              className="w-full h-full rounded-xl border"
              src="https://www.youtube.com/embed/slb-s5EYhOA"
              title="File Manager UI Walkthrough"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      </Section>

      {/* OVERVIEW */}
      <Section delay={200}>
        <h2 className="text-2xl font-semibold mt-10">Overview</h2>
        <p className="text-zinc-600 dark:text-zinc-300 leading-7 mt-3">
          Designed a modern file management interface focused on reducing navigation
          complexity and improving usability for everyday PC users.
        </p>
        <p className="text-zinc-600 dark:text-zinc-300 leading-7 mt-4">
          Collaborated in a small development team to create intuitive workflows,
          customizable navigation, file organization tools, search/sort functionality,
          and accessible UI features.
        </p>
      </Section>

      {/* IMAGE */}
      <Section delay={250}>
        <h2 className="text-2xl font-semibold mt-10 mb-4">
          Interface Preview
        </h2>

        <Image
          src="/file-manager-ui-pic.png"
          alt="File Manager UI"
          width={1200}
          height={800}
          className="rounded-xl border"
        />
      </Section>

      {/* CHALLENGES */}
      <Section delay={300}>
        <h2 className="text-2xl font-semibold mt-10">
          Challenges & What I Learned
        </h2>
        <p className="text-zinc-600 dark:text-zinc-300 mt-3 leading-7">
          One of the biggest challenges was designing an interface that balances
          simplicity with powerful functionality.
        </p>
        <p className="text-zinc-600 dark:text-zinc-300 mt-4 leading-7">
          This project strengthened my understanding of UI/UX design principles,
          frontend layout systems, and workflow optimization.
        </p>
      </Section>

      {/* SKILLS */}
      <Section delay={350}>
        <div className="mt-12 border-t pt-10">
          <h2 className="text-2xl font-semibold mb-4">
            Skills Gained
          </h2>

          <div className="grid sm:grid-cols-2 gap-4 text-zinc-600 dark:text-zinc-300">
            <ul className="list-disc pl-6 space-y-2">
              <li>React frontend development</li>
              <li>UI/UX design principles</li>
              <li>Component-based architecture</li>
              <li>Responsive design</li>
            </ul>

            <ul className="list-disc pl-6 space-y-2">
              <li>Workflow optimization</li>
              <li>Frontend debugging</li>
              <li>Design consistency systems</li>
              <li>Project documentation</li>
            </ul>
          </div>
        </div>
      </Section>

      {/* ================= BACKUP MODAL ================= */}
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

            {/* GOOGLE DRIVE BACKUP */}
            <iframe
              className="w-full h-full rounded-xl"
              src="https://drive.google.com/file/d/1nXZS0QjUWbmrRVHleHprE4RbcuBbf030/preview"
              allow="autoplay"
            />
          </div>
        </div>
      )}
    </main>
  );
}