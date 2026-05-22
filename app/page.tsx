"use client";

import FakeAI from "@/components/FakeAI";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react"; // ✅ ADDED (required for modal)

const projects = [
  {
    title: "Student Risk Prediction System (AI + ML + WEB APP)",
    type: "Personal Project",
    href: "/projects/student-risk-prediction-system",
    tech: "Python • Scikit-learn • Pandas • Streamlit • LLM (Nova / Llama 3)",
  },
  {
    title: "D&D Character Builder",
    type: "Group Project",
    href: "/projects/dnd-builder",
    tech: "Python • Spring Boot • SQL • Database Design",
  },
  {
    title: "Stateful Browser Automation Engine",
    type: "Personal Project",
    href: "/projects/stateful-browser-automation-engine",
    tech: "Python • Playwright • Chromium • Session Automation",
  },
  {
    title: "Chat Server",
    type: "Personal Project",
    href: "/projects/chat-server",
    tech: "Java • Sockets • Networking",
  },
  {
    title: "File Manager UI",
    type: "Partnership Project",
    href: "/projects/file-manager-ui",
    tech: "HTML • React • UI/UX • Frontend Design",
  },
];

const skills = {
  technical: [
    { name: "Python", href: "/projects/student-risk-prediction-system" },
    { name: "Java", href: "/projects/chat-server" },
    { name: "SQL / MySQL Workshop", href: "/projects/dnd-builder" },
    { name: "Client-Server Architecture", href: "/projects/chat-server" },
    { name: "Basic Networking Concepts", href: "/projects/chat-server" },
    { name: "Machine Learning (Random Forest)", href: "/projects/student-risk-prediction-system" },
    { name: "Data Analysis", href: "/projects/student-risk-prediction-system" },
    { name: "Feature Engineering", href: "/projects/student-risk-prediction-system" },
    { name: "Playwright Automation", href: "/projects/stateful-browser-automation-engine" },
    { name: "React / UI Development", href: "/projects/file-manager-ui" },
    { name: "Streamlit Web Apps", href: "/projects/student-risk-prediction-system" },
    { name: "Chromium Automation", href: "/projects/stateful-browser-automation-engine" },
    { name: "Database Design", href: "/projects/dnd-builder" },
    { name: "Data Visualization", href: "/projects/student-risk-prediction-system" },
    { name: "Software Architecture", href: "/projects/dnd-builder" },
  ],
  interpersonal: [
    { name: "Teamwork & Collaboration", href: "/projects/dnd-builder" },
    { name: "Clear Technical Communication", href: "/projects/chat-server" },
    { name: "Critical Thinking", href: "/projects/student-risk-prediction-system" },
    { name: "Problem Solving & Innovation", href: "/projects/stateful-browser-automation-engine" },
    { name: "Research & Documentation", href: "/projects/student-risk-prediction-system" },
    { name: "Creative Thinking", href: "/projects/file-manager-ui" },
    { name: "Data-Driven Decision Making", href: "/projects/student-risk-prediction-system" },
  ],
  professional: [
    { name: "GitHub Workflow", href: "/projects/stateful-browser-automation-engine" },
    { name: "System Debugging", href: "/projects/chat-server" },
    { name: "Project Documentation", href: "/projects/student-risk-prediction-system" },
    { name: "Process Automation", href: "/projects/stateful-browser-automation-engine" },
    { name: "Strategic Planning", href: "/projects/dnd-builder" },
    { name: "Report Generation", href: "/projects/student-risk-prediction-system" },
    { name: "Workflow Optimization", href: "/projects/stateful-browser-automation-engine" },
    { name: "Full-Stack Integration", href: "/projects/file-manager-ui" },
    { name: "MVC Architecture", href: "/projects/dnd-builder" },
  ],
};

export default function Home() {
  const [coverOpen, setCoverOpen] = useState(false); // ✅ ADDED
  const [resumeOpen, setResumeOpen] = useState(false);

  return (
    <main className="max-w-5xl mx-auto px-6 py-16 space-y-24 bg-black text-white min-h-screen">

      {/* ================= HEADER ================= */}
      <section className="flex flex-col md:flex-row items-center justify-between gap-10 text-center md:text-left">
        <div className="space-y-4 flex-1">
          <h1 className="text-6xl font-bold tracking-tight">
            Braxton Vogel
          </h1>

          <p className="text-zinc-300 text-lg">
            SOFTWARE ENGINEERING STUDENT - SHSU
          </p>

          <p className="text-zinc-300 text-lg">
            Sam Houston State University • 2024 – Present
          </p>

          <div className="text-zinc-400 text-sm flex justify-center md:justify-start gap-6 flex-wrap">
            <p>bvg007@shsu.edu</p>
            <p>346-413-7560</p>
          </div>

          <div className="flex justify-center md:justify-start flex-wrap gap-4 pt-4">
            <a
              href="https://github.com/braxtonvogel"
              target="_blank"
              className="px-4 py-2 border border-white rounded-full hover:bg-white hover:text-black transition"
            >
              GitHub
            </a>

            <a
              href="https://www.linkedin.com/in/braxton-vogel-ba2547391/"
              target="_blank"
              className="px-4 py-2 border border-white rounded-full hover:bg-white hover:text-black transition"
            >
              LinkedIn
            </a>

          <button
  onClick={() => setResumeOpen(true)}
  className="px-4 py-2 border border-white rounded-full hover:bg-white hover:text-black transition"
>
  Resume
</button>

            {/* ✅ COVER LETTER BUTTON (FIXED) */}
            <button
              onClick={() => setCoverOpen(true)}
              className="px-4 py-2 border border-white rounded-full hover:bg-white hover:text-black transition"
            >
              Cover Letter
            </button>
          </div>
        </div>

        <div className="flex-shrink-0">
          <Image
            src="/Brax_Prof_Pic.jpg"
            alt="Braxton Vogel"
            width={280}
            height={280}
            priority
            className="rounded-2xl border border-white object-cover"
          />
        </div>
      </section>

      {/* ================= COVER LETTER MODAL ================= */}
      {coverOpen && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={() => setCoverOpen(false)}
        >
          <div
            className="relative w-[90%] h-[90%] bg-white rounded-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* CLOSE BUTTON */}
            <button
              onClick={() => setCoverOpen(false)}
              className="absolute top-3 right-3 text-black text-2xl font-bold z-10"
            >
              ✕
            </button>

            {/* PDF VIEWER */}
            <iframe
              src="/cover-letter.pdf"
              className="w-full h-full"
            />
          </div>
        </div>
      )}

{resumeOpen && (
  <div
    className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
    onClick={() => setResumeOpen(false)}
  >
    <div
      className="relative w-[90%] h-[90%] bg-white rounded-xl overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      {/* CLOSE BUTTON */}
      <button
        onClick={() => setResumeOpen(false)}
        className="absolute top-3 right-3 text-black text-2xl font-bold z-10"
      >
        ✕
      </button>

      {/* PDF VIEWER */}
      <iframe
        src="/Braxton_Vogel_Resume.pdf"
        className="w-full h-full"
      />
    </div>
  </div>
)}


      {/* ================= OVERVIEW ================= */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">
          START HERE - Portfolio Overview
        </h2>
        <p className="text-zinc-300 leading-7">
          Hi, I’m Braxton Vogel, a Software Engineering student at Sam Houston State University.
          I enjoy building practical systems and user-focused applications, with an interest in backend development,
          UI design, full-stack software engineering, and data science.
          After I finish my bachelor’s degree, I want to pursue a master’s in computing & data science.
        </p>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold">What I Build</h3>
          <p className="text-zinc-300 leading-7">
            I focus on projects involving:
          </p>
          <ul className="list-disc pl-6 text-zinc-300 space-y-1">
            <li>Systems programming (networking, CLI tools)</li>
            <li>Database-driven applications</li>
            <li>UI/UX prototypes</li>
            <li>Software that solves real workflow problems</li>
          </ul>
        </div>
      </section>

      {/* ================= CERTIFICATIONS ================= */}
      <section>
        <Link href="/certifications">
          <div className="p-8 border border-white rounded-xl transition-all duration-300 ease-out hover:scale-[1.03] hover:-translate-y-1 hover:shadow-[0_0_25px_rgba(255,255,255,0.15)] cursor-pointer">
            <h2 className="text-2xl font-semibold">Certifications</h2>
            <p className="text-zinc-400 mt-2">
              View certifications and technical skills
            </p>
          </div>
        </Link>
      </section>

      {/* ================= PROJECTS ================= */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Projects</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {projects.map((project) => (
            <Link key={project.href} href={project.href}>
              <div className="group border border-white rounded-xl p-5 flex flex-col transition-all duration-300 hover:scale-[1.03] cursor-pointer">
                <h3 className="text-lg font-semibold leading-snug">
                  {project.title}
                </h3>

                <div className="max-h-0 opacity-0 overflow-hidden group-hover:max-h-40 group-hover:opacity-100 transition-all duration-300 mt-0 group-hover:mt-3">
                  <p className="text-xs text-zinc-400">{project.type}</p>
                  <p className="text-sm text-zinc-400 mt-1">{project.tech}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <FakeAI />
      </section>

      {/* ================= SKILLS ================= */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Skills</h2>

        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Technical</h3>
            <div className="space-y-2">
              {skills.technical.map((skill) => (
                <Link key={skill.name} href={skill.href}>
                  <div className="border border-white rounded-lg p-3 text-sm text-zinc-300 hover:bg-white hover:text-black transition hover:scale-[1.02] cursor-pointer">
                    {skill.name}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Interpersonal</h3>
            <div className="space-y-2">
              {skills.interpersonal.map((skill) => (
                <Link key={skill.name} href={skill.href}>
                  <div className="border border-white rounded-lg p-3 text-sm text-zinc-300 hover:bg-white hover:text-black transition hover:scale-[1.02] cursor-pointer">
                    {skill.name}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Professional</h3>
            <div className="space-y-2">
              {skills.professional.map((skill) => (
                <Link key={skill.name} href={skill.href}>
                  <div className="border border-white rounded-lg p-3 text-sm text-zinc-300 hover:bg-white hover:text-black transition hover:scale-[1.02] cursor-pointer">
                    {skill.name}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}