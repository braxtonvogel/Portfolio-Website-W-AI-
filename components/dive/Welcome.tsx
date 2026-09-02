"use client";

import Image from "next/image";
import { useState } from "react";
import { CONTACT_EMAIL, CONTACT_PHONE } from "@/lib/contact";

export default function Welcome({
  typed,
  welcomeClass,
  onDive,
}: {
  typed: string;
  welcomeClass: string;
  onDive: () => void;
}) {
  const [aboutOpen, setAboutOpen] = useState(false);
  const [coverOpen, setCoverOpen] = useState(false);
  const [resumeOpen, setResumeOpen] = useState(false);

  return (
    <>
      <div className={`${welcomeClass} absolute inset-0`} style={{ transformOrigin: "50% 50%" }}>
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="ripple-ring-static" />
          <div className="ripple-ring" />
          <div className="ripple-ring" />
          <div className="ripple-ring" />
          <div className="ripple-ring" />
          <div className="ripple-ring" />
        </div>

        <div className="absolute inset-0 flex flex-col md:flex-row items-center justify-start md:justify-center text-center md:text-left px-6 pt-16 md:pt-0 gap-8 md:gap-32 overflow-y-auto">
          <div className="space-y-6 max-w-3xl">
            <h1 className="text-6xl md:text-8xl font-bold tracking-tight">Braxton Vogel</h1>

            <p className="text-zinc-300 text-lg md:text-xl font-medium mt-2">Software Engineering Student</p>

            <p className="text-cyan-300 text-2xl md:text-4xl font-light mt-2">
              {typed}
              <span className="animate-pulse">|</span>
            </p>

            <div className="text-zinc-400 text-sm flex justify-center md:justify-start gap-6 flex-wrap">
              <p>{CONTACT_EMAIL}</p>
              <p>{CONTACT_PHONE}</p>
            </div>

            <div className="flex justify-center md:justify-start flex-wrap gap-4 pt-4">
              <button
                onClick={() => setAboutOpen(true)}
                className="px-4 py-2 border border-cyan-400/60 text-cyan-300 rounded-full hover:bg-cyan-500/10 transition"
              >
                About Me
              </button>

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

            <div className="flex justify-center md:justify-start pt-2">
              <button
                onClick={onDive}
                className="px-6 py-3 border border-cyan-400 rounded-full bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 transition shadow-[0_0_28px_rgba(56,189,248,0.35)]"
              >
                Dive into the experience &#8595;
              </button>
            </div>
          </div>

          <div className="flex-shrink-0 pb-8 md:pb-0">
            <Image
              src="/Brax_Prof_Pic.jpg"
              alt="Braxton Vogel"
              width={280}
              height={280}
              priority
              className="w-[180px] h-[180px] md:w-[280px] md:h-[280px] rounded-full border border-white/20 object-cover shadow-[0_0_60px_rgba(56,189,248,0.25)]"
            />
          </div>
        </div>
      </div>

      {aboutOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6" onClick={() => setAboutOpen(false)}>
          <div
            className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-zinc-950 border border-white/15 rounded-2xl p-8 shadow-[0_0_60px_rgba(56,189,248,0.15)]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setAboutOpen(false)}
              className="absolute top-4 right-4 text-white text-2xl font-bold hover:scale-125 transition"
            >
              &#10005;
            </button>

            <h2 className="text-3xl font-bold mb-1">About Me</h2>
            <p className="text-cyan-300 text-xs uppercase tracking-wider mb-6">
              Currently: coursework &amp; this portfolio &mdash; a new project is coming soon
            </p>

            <p className="text-zinc-300 leading-relaxed mb-6">
              I&apos;m a Software Engineering student at Sam Houston State University, building toward a career in
              backend systems, full-stack engineering, QA automation, and data science. I&apos;m drawn to projects
              that solve real problems &mdash; things that actually get used, not just submitted. Long-term, I&apos;m
              planning to pursue a master&apos;s degree in data science.
            </p>

            <h3 className="text-lg font-semibold mb-3">What I Build</h3>
            <div className="flex flex-wrap gap-2">
              {[
                "Backend systems & networking",
                "Full-stack & database-driven apps",
                "Machine learning & data pipelines",
                "Automation & workflow tooling",
              ].map((t) => (
                <span
                  key={t}
                  className="px-3 py-1.5 border border-cyan-400/40 rounded-full text-sm text-cyan-200 bg-cyan-500/5"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {coverOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={() => setCoverOpen(false)}>
          <div className="relative w-[90%] h-[90%] bg-white rounded-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setCoverOpen(false)} className="absolute top-3 right-3 text-black text-2xl font-bold z-10">
              &#10005;
            </button>
            <iframe src="/cover-letter.pdf" className="w-full h-full" />
          </div>
        </div>
      )}

      {resumeOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={() => setResumeOpen(false)}>
          <div className="relative w-[90%] h-[90%] bg-white rounded-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setResumeOpen(false)} className="absolute top-3 right-3 text-black text-2xl font-bold z-10">
              &#10005;
            </button>
            <iframe src="/Braxton_Vogel_Resume.pdf" className="w-full h-full" />
          </div>
        </div>
      )}
    </>
  );
}
