"use client";

import Navbar from "@/components/Navbar";
import ViewTransitionLink from "@/components/ViewTransitionLink";
import { motion } from "framer-motion";
import RippleRings from "@/components/RippleRings";
import { growthNotes } from "@/lib/growthNotes";
import { SITE_NAV_BRAND, SITE_NAV_PINNED, siteNavItems } from "@/lib/siteNav";

export default function EarlyDevelopmentPage() {
  return (
    <>
      <Navbar brand={SITE_NAV_BRAND} pinned={SITE_NAV_PINNED} items={siteNavItems("early-development")} />
      <main className="relative isolate overflow-hidden min-h-screen px-6 pt-28 pb-16 bg-zinc-50 dark:bg-black text-black dark:text-white">
        <RippleRings top={157} height={400} />

      {/* ================= HERO ================= */}
      <ViewTransitionLink
        href="/"
        className="group inline-flex items-center gap-1.5 text-sm text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
      >
        <svg className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back Home
      </ViewTransitionLink>

      <div className="max-w-2xl mt-10">
        <p className="text-xs font-semibold tracking-[0.2em] text-cyan-600 dark:text-cyan-400 uppercase">
          Growth &amp; Learning
        </p>
        <h1 className="text-5xl font-bold mt-3 tracking-tight">
          Early Personal Development
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 mt-4 leading-7">
          Notes and reflections from early on in my growth as a developer &mdash;
          outside of formal coursework or certifications. This is where I write
          down what I&apos;m learning while it&apos;s still forming.
        </p>
      </div>

      {/* ================= NOTES ================= */}
      <div className="max-w-5xl mt-14 space-y-8">
        {growthNotes.map((note, i) => (
          <motion.div
            key={note.slug}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
            className="rounded-2xl border border-zinc-200/70 dark:border-zinc-800/70 bg-white/70 dark:bg-zinc-950/50 backdrop-blur-md shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-8"
          >
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <span className="text-xs font-semibold tracking-widest text-cyan-600 dark:text-cyan-400 uppercase">
                  Note {String(i + 1).padStart(2, "0")}
                </span>
                <h2 className="text-2xl font-bold mt-1">{note.title}</h2>
              </div>

              <a
                href={note.pdf}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-900 hover:text-white hover:border-zinc-900 dark:hover:bg-white dark:hover:text-zinc-900 dark:hover:border-white transition-colors"
              >
                Open full PDF
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400">
                {note.date}
              </span>
              {note.person && (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400">
                  {note.person}
                </span>
              )}
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400">
                {note.topic}
              </span>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 mt-6">
              <p className="text-zinc-700 dark:text-zinc-300 leading-7 flex-1">
                {note.description}
              </p>

              <div className="w-full lg:w-[320px] h-[420px] flex-shrink-0 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-inner bg-white">
                <iframe
                  src={`${note.pdf}#toolbar=0`}
                  title={`${note.title} preview`}
                  className="w-full h-full"
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      </main>
    </>
  );
}
