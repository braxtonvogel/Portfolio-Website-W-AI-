"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import FakeAI from "@/components/FakeAI";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { CONTACT_EMAIL, CONTACT_PHONE } from "@/lib/contact";

const projects = [
  {
    title: "SammyOS - Context Aware AI Productivity Platform",
    type: "Personal Project",
    href: "/projects/sammyos",
    tech: "Tauri • Next.js • Rust • Zustand • Redis (Upstash) • Multi-LLM Routing",
    category: "personal",
  },
  {
    title: "Student Risk Prediction System (AI + ML + WEB APP)",
    type: "Personal Project",
    href: "/projects/student-risk-prediction-system",
    tech: "Python • Scikit-learn • Pandas • Streamlit • LLM (Nova / Llama 3)",
    category: "personal",
  },
  {
    title: "D&D Character Builder",
    type: "Group Project",
    href: "/projects/dnd-builder",
    tech: "Python • Spring Boot • SQL • Database Design",
    category: "class",
  },
  {
    title: "Stateful Browser Automation Engine",
    type: "Personal Project",
    href: "/projects/stateful-browser-automation-engine",
    tech: "Python • Playwright • Chromium • Session Automation",
    category: "personal",
  },
  {
    title: "Chat Server",
    type: "Personal Project",
    href: "/projects/chat-server",
    tech: "Java • Sockets • Networking",
    category: "class",
  },
  {
    title: "File Manager UI",
    type: "Partnership Project",
    href: "/projects/file-manager-ui",
    tech: "HTML • React • UI/UX • Frontend Design",
    category: "class",
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

const phrases = [
  "Intelligent Software Systems",
  "AI-powered Tools",
  "Modern Engineering Experiences",
  "Full-Stack Applications",
  "Automation Systems",
  "Data Science Pipelines",
];

export default function Home() {
  const [coverOpen, setCoverOpen] = useState(false);
  const [resumeOpen, setResumeOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [projectFilter, setProjectFilter] = useState<"all" | "personal" | "class">("all");

  const [phraseIndex, setPhraseIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [deleting, setDeleting] = useState(false);

  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0.2]);
  const heroY = useTransform(scrollY, [0, 400], [0, 80]);

  useEffect(() => {
    const current = phrases[phraseIndex];

    const timeout = setTimeout(() => {
      if (!deleting) {
        if (displayText.length < current.length) {
          setDisplayText(current.slice(0, displayText.length + 1));
        } else {
          setTimeout(() => setDeleting(true), 1000);
        }
      } else {
        if (displayText.length > 0) {
          setDisplayText(current.slice(0, displayText.length - 1));
        } else {
          setDeleting(false);
          setPhraseIndex((p) => (p + 1) % phrases.length);
        }
      }
    }, deleting ? 40 : 70);

    return () => clearTimeout(timeout);
  }, [displayText, deleting, phraseIndex]);

  useEffect(() => {
    const sections = ["home", "education", "projects", "skills", "contact"];

    const handleScroll = () => {
      let current = "home";

      for (const id of sections) {
        const el = document.getElementById(id);
        if (!el) continue;

        const rect = el.getBoundingClientRect();
        if (rect.top <= window.innerHeight * 0.35) {
          current = id;
        }
      }

      setActiveSection((prev) => (prev === current ? prev : current));
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main className="relative isolate overflow-x-hidden bg-black text-white min-h-[100dvh]">

      {/* ================= CINEMATIC BACKGROUND ================= */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-200px] left-[-150px] w-[700px] h-[700px] rounded-full bg-cyan-500/15 blur-[140px] animate-orb-1" />
        <div className="absolute bottom-[-100px] right-[-200px] w-[800px] h-[800px] rounded-full bg-blue-500/15 blur-[160px] animate-orb-2" />
        <div className="absolute top-[30%] left-[40%] w-[500px] h-[500px] rounded-full bg-cyan-300/10 blur-[120px] animate-orb-3" />
      </div>

      {/* ================= NAV ================= */}
      <div className="fixed top-0 left-0 w-full z-50 flex justify-center bg-black/60 backdrop-blur-md border-b border-white/10 py-3 gap-2 md:gap-6 text-xs md:text-sm flex-wrap">

        <a
          href="#home"
          className={`relative group px-2 py-1 transition ${activeSection === "home" ? "text-white" : "text-zinc-300"}`}
        >
          Home
          <span className={`absolute left-0 -bottom-1 h-[1px] bg-cyan-400 transition-all ${activeSection === "home" ? "w-full" : "w-0 group-hover:w-full"}`} />
        </a>

        <a
          href="#education"
          className={`relative group px-2 py-1 transition ${activeSection === "education" ? "text-white" : "text-zinc-300"}`}
        >
          Education
          <span className={`absolute left-0 -bottom-1 h-[1px] bg-cyan-400 transition-all ${activeSection === "education" ? "w-full" : "w-0 group-hover:w-full"}`} />
        </a>

        <a
          href="#projects"
          className={`relative group px-2 py-1 transition ${activeSection === "projects" ? "text-white" : "text-zinc-300"}`}
        >
          Projects
          <span className={`absolute left-0 -bottom-1 h-[1px] bg-cyan-400 transition-all ${activeSection === "projects" ? "w-full" : "w-0 group-hover:w-full"}`} />
        </a>

        <a
          href="#skills"
          className={`relative group px-2 py-1 transition ${activeSection === "skills" ? "text-white" : "text-zinc-300"}`}
        >
          Skills
          <span className={`absolute left-0 -bottom-1 h-[1px] bg-cyan-400 transition-all ${activeSection === "skills" ? "w-full" : "w-0 group-hover:w-full"}`} />
        </a>

        <a
          href="#contact"
          className={`relative group px-2 py-1 transition ${activeSection === "contact" ? "text-white" : "text-zinc-300"}`}
        >
          Contact
          <span className={`absolute left-0 -bottom-1 h-[1px] bg-cyan-400 transition-all ${activeSection === "contact" ? "w-full" : "w-0 group-hover:w-full"}`} />
        </a>

      </div>

      {/* ================= HERO ================= */}
      <motion.section
        id="home"
        style={{ opacity: heroOpacity, y: heroY }}
        className="min-h-screen flex flex-col md:flex-row items-center justify-center text-center md:text-left px-6 pt-24 md:pt-0 relative gap-24 md:gap-40 scroll-mt-24"
      >
        {/* ================= RIPPLE RINGS ================= */}
        <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
          <div className="ripple-ring-static" />
          <div className="ripple-ring" />
          <div className="ripple-ring" />
          <div className="ripple-ring" />
          <div className="ripple-ring" />
          <div className="ripple-ring" />
        </div>

        <div className="space-y-6 max-w-3xl">
          <h1 className="text-6xl md:text-8xl font-bold tracking-tight">
            Braxton Vogel
          </h1>

          <p className="text-zinc-300 text-lg md:text-xl font-medium mt-2">
            Software Engineering Student
          </p>

          <p className="text-cyan-300 text-2xl md:text-4xl font-light mt-2">
            {displayText}
            <span className="animate-pulse">|</span>
          </p>

          <div className="text-zinc-400 text-sm flex justify-center md:justify-start gap-6 flex-wrap">
            <p>{CONTACT_EMAIL}</p>
            <p>{CONTACT_PHONE}</p>
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

            <button
              onClick={() => setCoverOpen(true)}
              className="px-4 py-2 border border-white rounded-full hover:bg-white hover:text-black transition"
            >
              Cover Letter
            </button>
          </div>
        </div>

        <div className="flex-shrink-0 mt-8 md:mt-0 md:ml-10">
          <Image
            src="/Brax_Prof_Pic.jpg"
            alt="Braxton Vogel"
            width={280}
            height={280}
            priority
            className="rounded-full border border-white/20 object-cover shadow-[0_0_60px_rgba(56,189,248,0.25)]"
          />
        </div>
      </motion.section>

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
            <button
              onClick={() => setCoverOpen(false)}
              className="absolute top-3 right-3 text-black text-2xl font-bold z-10"
            >
              ✕
            </button>
            <iframe src="/cover-letter.pdf" className="w-full h-full" />
          </div>
        </div>
      )}

      {/* ================= RESUME MODAL ================= */}
      {resumeOpen && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={() => setResumeOpen(false)}
        >
          <div
            className="relative w-[90%] h-[90%] bg-white rounded-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setResumeOpen(false)}
              className="absolute top-3 right-3 text-black text-2xl font-bold z-10"
            >
              ✕
            </button>
            <iframe src="/Braxton_Vogel_Resume.pdf" className="w-full h-full" />
          </div>
        </div>
      )}

      <div className="relative z-10 max-w-5xl mx-auto px-6 pb-20 pt-20 space-y-20">

        {/* ================= OVERVIEW ================= */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">
            About Me
          </h2>
          <p className="text-zinc-300 leading-7">
             I'm a Software Engineering student at Sam Houston State University,
    building toward a career in backend systems, full-stack engineering, QA automation, and data science.
    I'm drawn to projects that solve real problems, things that actually get used, not just submitted.
    Long-term, I'm planning to pursue a master's degree in data science.
          </p>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold">What I Build</h3>
            <p className="text-zinc-300 leading-7">
              I focus on projects involving:
            </p>
            <ul className="list-disc pl-6 text-zinc-300 space-y-1">
              <li>Backend systems and networking</li>
              <li>Full-stack and database-driven applications</li>
              <li>Machine learning and data pipelines</li>
              <li>Automation and workflow tooling</li>
            </ul>
          </div>
        </section>

        {/* ================= EDUCATION ================= */}
        <section id="education" className="space-y-6 scroll-mt-24">
          <h2 className="text-2xl font-semibold">Education</h2>

          <details className="group border border-white rounded-xl p-8 cursor-pointer transition-all duration-300 ease-out hover:scale-[1.03] hover:-translate-y-1 hover:shadow-[0_0_25px_rgba(255,255,255,0.15)]">
            <summary className="list-none flex flex-col items-center text-center">
              <h3 className="text-2xl font-semibold transition-all duration-300 group-hover:-translate-y-2">
                Sam Houston State University - SHSU
              </h3>
              <p className="text-zinc-400 opacity-0 group-hover:opacity-100 transition-all duration-300 mt-2">
                Click to view more
              </p>
            </summary>

            <div className="grid grid-rows-[0fr] group-open:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-in-out">
              <div className="overflow-hidden">
                <div className="mt-6 text-left w-full border-t border-zinc-700 pt-6 space-y-4 opacity-0 translate-y-3 group-open:opacity-100 group-open:translate-y-0 transition-all duration-500 ease-out">
                  <p className="text-zinc-200 leading-7">
                    <span className="font-semibold">
                      Bachelor of Science in Software Engineering
                    </span>
                    <br />
                    Sam Houston State University (SHSU), Huntsville, Texas
                  </p>

                  <ul className="list-disc pl-6 text-zinc-300 space-y-2">
                    <li>General GPA: 3.4</li>
                    <li>Major GPA: 3.6</li>
                    <li>Timeframe: 2024 - Present</li>
                  </ul>

                  <p className="text-zinc-300 leading-7">
                    During my time at Sam Houston State University, I have focused heavily
                    on building practical software engineering skills through independent
                    development projects, collaborative coursework, and self-driven
                    technical exploration outside the classroom. Alongside my academic
                    studies, I have developed full-stack applications, machine learning
                    systems, automation tools, networking projects, and UI-focused software
                    while continuously expanding my knowledge in software architecture,
                    data science, backend systems, and modern development workflows.
                  </p>
                </div>
              </div>
            </div>
          </details>
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
        <section id="projects" className="space-y-6 scroll-mt-24">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h2 className="text-2xl font-semibold">Projects</h2>

            <div className="flex gap-2">
              {(["all", "personal", "class"] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setProjectFilter(filter)}
                  className={`px-4 py-1.5 rounded-full text-sm border transition-all duration-200 capitalize
                    ${
                      projectFilter === filter
                        ? "bg-white text-black border-white"
                        : "border-zinc-600 text-zinc-400 hover:border-white hover:text-white"
                    }`}
                >
                  {filter === "all" ? "All" : filter === "personal" ? "Personal" : "Class"}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {projects
              .filter((p) => projectFilter === "all" || p.category === projectFilter)
              .map((project) => (
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
        <motion.section
          id="skills"
          className="space-y-6 scroll-mt-40"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.4 }}
        >
          <h2 className="text-2xl font-semibold">Skills</h2>

          <div className="grid md:grid-cols-3 gap-6">

            {/* ================= TECHNICAL ================= */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-zinc-200">Technical</h3>
              <div className="flex flex-wrap gap-3">
                {skills.technical.map((skill, index) => (
                  <Link href={skill.href} key={skill.name}>
                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.03, ease: [0.2, 0.8, 0.2, 1] }}
                      className="px-4 py-2 rounded-full border border-zinc-700 text-sm text-zinc-300 bg-white/5 backdrop-blur-sm cursor-pointer hover:bg-white hover:text-black hover:border-white hover:shadow-[0_0_20px_rgba(255,255,255,0.25)] hover:-translate-y-1 hover:scale-105 transition-all duration-300 ease-out"
                    >
                      {skill.name}
                    </motion.div>
                  </Link>
                ))}
              </div>
            </div>

            {/* ================= INTERPERSONAL ================= */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-zinc-200">Interpersonal</h3>
              <div className="flex flex-wrap gap-3">
                {skills.interpersonal.map((skill, index) => (
                  <motion.div
                    key={skill.name}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.03, ease: [0.2, 0.8, 0.2, 1] }}
                    className="px-4 py-2 rounded-full border border-zinc-700 text-sm text-zinc-300 bg-white/5 backdrop-blur-sm cursor-pointer hover:bg-white hover:text-black hover:border-white hover:shadow-[0_0_20px_rgba(255,255,255,0.25)] hover:-translate-y-1 hover:scale-105 transition-all duration-300 ease-out"
                  >
                    {skill.name}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* ================= PROFESSIONAL ================= */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-zinc-200">Professional</h3>
              <div className="flex flex-wrap gap-3">
                {skills.professional.map((skill, index) => (
                  <motion.div
                    key={skill.name}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.03, ease: [0.2, 0.8, 0.2, 1] }}
                    className="px-4 py-2 rounded-full border border-zinc-700 text-sm text-zinc-300 bg-white/5 backdrop-blur-sm cursor-pointer hover:bg-white hover:text-black hover:border-white hover:shadow-[0_0_20px_rgba(255,255,255,0.25)] hover:-translate-y-1 hover:scale-105 transition-all duration-300 ease-out"
                  >
                    {skill.name}
                  </motion.div>
                ))}
              </div>
            </div>

          </div>
        </motion.section>

        {/* ================= CONTACT ================= */}
        <section id="contact" className="space-y-6 scroll-mt-24">
          <h2 className="text-2xl font-semibold">Contact</h2>

          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();

              const form = e.target as HTMLFormElement;
              const name = (form.elements.namedItem("name") as HTMLInputElement).value;
              const email = (form.elements.namedItem("email") as HTMLInputElement).value;
              const phone = (form.elements.namedItem("phone") as HTMLInputElement).value;
              const message = (form.elements.namedItem("message") as HTMLTextAreaElement).value;

              const subject = `Portfolio Contact from ${name}`;
              const body = [
                `Name: ${name}`,
                `Email: ${email}`,
                `Phone: ${phone || "Not provided"}`,
                "",
                "Message:",
                message,
              ].join("\n");

              const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
              window.location.href = mailto;
            }}
          >
            <input
              name="name"
              placeholder="Your Name"
              className="w-full p-3 rounded-lg bg-white/5 border border-zinc-700 text-white"
              required
            />

            <input
              name="email"
              placeholder="Your Email"
              className="w-full p-3 rounded-lg bg-white/5 border border-zinc-700 text-white"
              required
            />

            <input
              name="phone"
              placeholder="Your Phone (optional)"
              className="w-full p-3 rounded-lg bg-white/5 border border-zinc-700 text-white"
            />

            <textarea
              name="message"
              placeholder="Your Message"
              rows={5}
              className="w-full p-3 rounded-lg bg-white/5 border border-zinc-700 text-white"
              required
            />

            <button
              type="submit"
              className="px-6 py-3 border border-white rounded-lg hover:bg-white hover:text-black transition"
            >
              Send Message
            </button>
          </form>
        </section>

      </div>
    </main>
  );
}