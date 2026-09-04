"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import ViewTransitionLink from "@/components/ViewTransitionLink";
import type { Certification, CertSegment } from "@/lib/certifications";

// Course completion certificates, in order — files live in /public
const certificateFiles = [
  { number: 1, label: "Foundations: Data, Data, Everywhere", file: "/Foundations-Data,Data,Everywhere.png" },
  { number: 2, label: "Ask Questions to Make Data-Driven Decisions", file: "/Ask_Questions_To_MakeData-Driven_Decisions.png" },
  { number: 3, label: "Prepare Data for Exploration", file: "/Prepare_Data_For_Exploration.png" },
  { number: 4, label: "Process Data from Dirty to Clean", file: "/Process_Data_From_Dirty_to_Clean.png" },
  { number: 5, label: "Analyze Data to Answer Questions", file: "/Analyze_Data_to_Answer_Questions.png" },
  { number: 6, label: "Share Data Through the Art of Visualization", file: "/Share_Data_Through_the_Art_of_Visualization.png" },
  { number: 7, label: "Introduction to Data Analysis Using Python", file: "/Introduction_to_Data_Analysis_Using_Python.png" },
  { number: 8, label: "Google Data Analytics Capstone: Complete a Case Study", file: "/Google_Data_Analytics_Capstone-Complete_a_Case_Study.png" },
  { number: 9, label: "Accelerate Your Job Search with AI", file: "/Accelerate_Your_Job_Search_with_AI.png" },
];

export default function CertificationScrollExperience({
  cert,
}: {
  cert: Certification;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  const blobWrapRefs = useRef<(HTMLDivElement | null)[]>([]);
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);
  const glassRef = useRef<HTMLDivElement>(null);
  const pulseRef = useRef<{ start: number }>({ start: -Infinity });

  const [activeIndex, setActiveIndex] = useState(0);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [activeCertTab, setActiveCertTab] = useState(1);

  const total = cert.segments.length + 2; // +1 hero section, +1 certificate gallery section
  const galleryIndex = total - 1;

  // track which section is centered, for the progress dots + subtle card highlight
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute("data-index"));
            setActiveIndex(idx);
          }
        });
      },
      { root: container, threshold: 0.6 }
    );

    sectionRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // every time the active section changes, kick off a "pulse" — the whole
  // line dips (recedes) and springs back (returns) — read by the ticker below
  useEffect(() => {
    pulseRef.current.start = performance.now();
  }, [activeIndex]);

  // a single continuous rAF loop (not scroll-event-driven) so the pulse keeps
  // animating even after scrolling stops, and everything stays perfectly smooth
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let rafId: number;

    const tick = () => {
      const scrollTop = container.scrollTop;
      const maxScroll = container.scrollHeight - container.clientHeight;
      const progress = maxScroll > 0 ? scrollTop / maxScroll : 0;

      // liquid glass blobs
      blobWrapRefs.current.forEach((el, i) => {
        if (!el) return;
        const dir = i % 2 === 0 ? 1 : -1;
        const translateY = progress * 45 * dir;
        const hue = progress * 90 * dir;
        el.style.transform = `translateY(${translateY}vh)`;
        el.style.filter = `hue-rotate(${hue}deg)`;
      });

      if (glassRef.current) {
        const blurAmount = 16 + progress * 22;
        glassRef.current.style.backdropFilter = `blur(${blurAmount}px) saturate(160%)`;
        (glassRef.current.style as unknown as { webkitBackdropFilter: string }).webkitBackdropFilter = `blur(${blurAmount}px) saturate(160%)`;
      }

      // whole-line pulse: dips down then returns as a new section becomes active
      const pulseElapsed = performance.now() - pulseRef.current.start;
      const pulseDuration = 900;
      const pulseT = Math.min(pulseElapsed / pulseDuration, 1);
      const pulseMultiplier =
        pulseElapsed < pulseDuration ? 1 - 0.6 * Math.sin(pulseT * Math.PI) : 1;

      const viewportCenter = scrollTop + container.clientHeight / 2;

      pathRefs.current.forEach((el, i) => {
        if (!el) return;
        const segmentCenter = (i + 0.5) * container.clientHeight;
        const distanceInSections =
          Math.abs(segmentCenter - viewportCenter) / container.clientHeight;
        const baseCloseness = Math.max(0, 1 - Math.pow(distanceInSections / 1.3, 1.5));
        const closeness = Math.max(0, Math.min(1, baseCloseness * pulseMultiplier));

        el.style.strokeWidth = `${0.25 + closeness * 1.15}`;
        el.style.opacity = `${0.12 + closeness * 0.65}`;
        el.style.filter = `blur(${(1 - closeness) * 2.2}px)`;
      });

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  // freeze background scroll while the deep-dive overlay is open
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.style.overflow = expandedIndex !== null ? "hidden" : "";
  }, [expandedIndex]);

  const closeOverlay = useCallback(() => {
    setOverlayVisible(false);
    setTimeout(() => setExpandedIndex(null), 300);
  }, []);

  // trigger the overlay's enter transition a tick after mount, and close on Escape
  useEffect(() => {
    if (expandedIndex === null) return;
    const id = requestAnimationFrame(() => setOverlayVisible(true));
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeOverlay();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("keydown", onKey);
    };
  }, [expandedIndex, closeOverlay]);

  const scrollToSection = (index: number) => {
    sectionRefs.current[index]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const scrollToTop = () => {
    containerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  // one continuous curved path through every section, bulging left/right each
  // segment — used only for the flowing dashed overlay
  const pathD = useMemo(() => {
    const amp = 18;
    let d = "M 50 0";
    for (let i = 0; i < total; i++) {
      const y0 = i * 100;
      const y1 = (i + 1) * 100;
      const dir = i % 2 === 0 ? 1 : -1;
      const cx = 50 + amp * dir;
      d += ` C ${cx} ${y0 + 33}, ${cx} ${y0 + 67}, 50 ${y1}`;
    }
    return d;
  }, [total]);

  // the same curve split into one segment per section (including the last one,
  // so the line runs the full height of the page) for independent depth control
  const segmentPaths = useMemo(() => {
    const amp = 18;
    const segments: string[] = [];
    for (let i = 0; i < total; i++) {
      const y0 = i * 100;
      const y1 = (i + 1) * 100;
      const dir = i % 2 === 0 ? 1 : -1;
      const cx = 50 + amp * dir;
      segments.push(`M 50 ${y0} C ${cx} ${y0 + 33}, ${cx} ${y0 + 67}, 50 ${y1}`);
    }
    return segments;
  }, [total]);

  const round = (n: number) => Math.round(n * 10000) / 10000;
  const depthFor = (index: number) =>
    round(0.6 + 0.4 * Math.sin((index / total) * Math.PI * 3));

  const activeSegment: CertSegment | null =
    expandedIndex !== null ? cert.segments[expandedIndex] : null;

  const activeCertificate = certificateFiles.find((c) => c.number === activeCertTab);

  return (
    <div
      ref={containerRef}
      className="h-screen w-full overflow-y-scroll snap-y snap-proximity scroll-smooth relative bg-zinc-50 dark:bg-black text-black dark:text-white [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {/* liquid glass background — ambient drift + scroll-reactive hue/position shift */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div ref={(el) => { blobWrapRefs.current[0] = el; }} className="liquid-wrap liquid-wrap-1">
          <div className="liquid-blob liquid-blob-1" />
        </div>
        <div ref={(el) => { blobWrapRefs.current[1] = el; }} className="liquid-wrap liquid-wrap-2">
          <div className="liquid-blob liquid-blob-2" />
        </div>
        <div ref={(el) => { blobWrapRefs.current[2] = el; }} className="liquid-wrap liquid-wrap-3">
          <div className="liquid-blob liquid-blob-3" />
        </div>
        <div
          ref={glassRef}
          className="absolute inset-0 bg-white/10 dark:bg-black/10"
          style={{ backdropFilter: "blur(16px) saturate(160%)" }}
        />
      </div>

      <style>{`
        .liquid-wrap { position: absolute; will-change: transform, filter; transition: filter 0.2s linear; }
        .liquid-wrap-1 { top: -12%; left: -10%; width: 42vw; height: 42vw; }
        .liquid-wrap-2 { bottom: -14%; right: -8%; width: 38vw; height: 38vw; }
        .liquid-wrap-3 { top: 40%; left: 50%; width: 30vw; height: 30vw; }
        .liquid-blob { width: 100%; height: 100%; border-radius: 50%; filter: blur(90px); opacity: 0.4; will-change: transform; }
        .liquid-blob-1 { background: radial-gradient(circle, #93c5fd, transparent 70%); animation: drift1 26s ease-in-out infinite; }
        .liquid-blob-2 { background: radial-gradient(circle, #c4b5fd, transparent 70%); animation: drift2 32s ease-in-out infinite; }
        .liquid-blob-3 { background: radial-gradient(circle, #99f6e4, transparent 70%); animation: drift3 22s ease-in-out infinite; transform: translateX(-50%); }
        .dark .liquid-blob { opacity: 0.2; }
        @keyframes drift1 { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(6vw, 8vh) scale(1.15); } }
        @keyframes drift2 { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(-8vw, -5vh) scale(1.1); } }
        @keyframes drift3 { 0%, 100% { transform: translate(-50%, 0) scale(1); } 50% { transform: translate(-45%, -6vh) scale(1.2); } }
        @keyframes dashFlow { to { stroke-dashoffset: -200; } }
      `}</style>

      {/* curved connector line running through every section, depth-reactive to scroll + pulse */}
      <svg
        className="absolute left-0 top-0 w-full pointer-events-none z-[5]"
        style={{ height: `${total * 100}vh` }}
        viewBox={`0 0 100 ${total * 100}`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {segmentPaths.map((d, i) => (
          <path
            key={i}
            ref={(el) => { pathRefs.current[i] = el; }}
            d={d}
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            className="text-zinc-500 dark:text-zinc-300"
          />
        ))}
        <path
          d={pathD}
          fill="none"
          stroke="currentColor"
          strokeWidth="0.4"
          strokeDasharray="4 10"
          className="text-zinc-500 dark:text-zinc-300 opacity-60"
          style={{ animation: "dashFlow 4s linear infinite" }}
        />
      </svg>

      {/* back to certifications list — always visible, top-left; expands to show label on hover */}
      <ViewTransitionLink
        href="/certifications"
        aria-label="Back to Certifications"
        className="group fixed left-4 sm:left-8 top-4 sm:top-8 z-20 flex h-10 items-center gap-2 overflow-hidden rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-lg pl-2.5 pr-2.5 hover:pr-4 transition-all duration-300 ease-out"
      >
        <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
        </svg>
        <span className="max-w-0 group-hover:max-w-[12rem] overflow-hidden whitespace-nowrap text-sm font-medium transition-all duration-300 ease-out">
          Back to Certifications
        </span>
      </ViewTransitionLink>

      {/* back to top + progress dots */}
      <div className="fixed right-4 sm:right-8 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-3">
        <button
          onClick={scrollToTop}
          aria-label="Back to top"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-lg hover:scale-110 active:scale-95 transition-transform"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
          </svg>
        </button>

        <div className="h-px w-4 bg-zinc-300 dark:bg-zinc-700" />

        <div className="flex flex-col gap-2">
          {Array.from({ length: total }).map((_, i) => (
            <button
              key={i}
              onClick={() => scrollToSection(i)}
              aria-label={i === 0 ? "Go to overview" : `Go to course ${i}`}
              className="p-1.5 -m-1.5 group"
            >
              <span
                className={`block h-2 w-2 rounded-full transition-all duration-300 group-hover:scale-150 ${
                  activeIndex === i
                    ? "bg-zinc-800 dark:bg-zinc-200 scale-125"
                    : "bg-zinc-300 dark:bg-zinc-700"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* hero section */}
      <section
        ref={(el) => { sectionRefs.current[0] = el; }}
        data-index={0}
        className="snap-start h-screen w-full flex items-center justify-center relative z-10 px-6"
      >
        <div className="max-w-2xl mx-auto text-center">
          <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 mt-6">
            <Image
              src={cert.image}
              alt={cert.title}
              fill
              sizes="(min-width: 672px) 672px, 100vw"
              className="object-cover"
            />
          </div>

          <h1 className="text-4xl font-bold mt-6">{cert.title}</h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-2">{cert.tags.join(" • ")}</p>
          <p className="mt-4 text-zinc-700 dark:text-zinc-300">{cert.summary}</p>
          <p className="mt-10 text-xs uppercase tracking-widest text-zinc-400 animate-bounce">
            Scroll ↓
          </p>
        </div>
      </section>

      {/* segment sections */}
      {cert.segments.map((segment, i) => {
        const index = i + 1;
        const isLeft = i % 2 === 0;
        const isActive = activeIndex === index;
        const depth = depthFor(index);

        return (
          <section
            key={i}
            ref={(el) => { sectionRefs.current[index] = el; }}
            data-index={index}
            className="snap-start h-screen w-full flex items-center relative z-10 px-6"
          >
            <div className="max-w-3xl w-full mx-auto relative">
              <span
                className="hidden sm:block absolute left-1/2 top-1/2 rounded-full bg-zinc-500 ring-4 ring-zinc-50 dark:ring-black z-10"
                style={{
                  width: `${round(8 + depth * 10)}px`,
                  height: `${round(8 + depth * 10)}px`,
                  opacity: round(0.4 + depth * 0.6),
                  filter: `blur(${round((1 - depth) * 1.5)}px)`,
                  transform: `translate(-50%, -50%)`,
                }}
              />

              <div
                className={`w-full sm:w-1/2 transition-all duration-500 ease-out ${
                  isLeft ? "sm:pr-12 sm:text-right sm:mr-auto" : "sm:pl-12 sm:text-left sm:ml-auto"
                } ${isActive ? "opacity-100 scale-100" : "opacity-50 scale-95"}`}
              >
                <button
                  onClick={() => setExpandedIndex(i)}
                  className={`group w-full text-left rounded-2xl p-6 border border-zinc-200/70 dark:border-zinc-800/70 bg-white/60 dark:bg-zinc-950/50 backdrop-blur-md shadow-sm hover:shadow-md transition-shadow ${
                    isLeft ? "sm:text-right" : "sm:text-left"
                  }`}
                >
                  <span className="text-sm font-medium text-zinc-400">
                    {String(index).padStart(2, "0")} / {String(cert.segments.length).padStart(2, "0")}
                  </span>

                  <div className={`flex items-center gap-2 mt-1 ${isLeft ? "sm:flex-row-reverse sm:justify-start" : ""}`}>
                    <h3 className="text-2xl font-semibold">{segment.title}</h3>
                    <svg
                      className="h-4 w-4 flex-shrink-0 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-5v4m0-4h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                  </div>

                  <p className="text-zinc-600 dark:text-zinc-400 mt-2">{segment.description}</p>

                  <span className="inline-block mt-3 text-xs font-medium text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
                    Click to expand →
                  </span>
                </button>
              </div>
            </div>
          </section>
        );
      })}

      {/* certificate gallery section — numbered tabs 1-9, one certificate image per tab */}
      <section
        ref={(el) => { sectionRefs.current[galleryIndex] = el; }}
        data-index={galleryIndex}
        className="snap-start min-h-screen w-full flex items-center relative z-10 px-6 py-20"
      >
        <div className="max-w-3xl w-full mx-auto">
          <h2 className="text-3xl font-bold mb-6">Course Certificates</h2>

          <div className="rounded-2xl border border-zinc-200/70 dark:border-zinc-800/70 bg-white/60 dark:bg-zinc-950/50 backdrop-blur-md shadow-sm p-6">
            <div className="flex flex-wrap gap-2 mb-6">
              {certificateFiles.map((c) => (
                <button
                  key={c.number}
                  onClick={() => setActiveCertTab(c.number)}
                  aria-label={`View certificate ${c.number}: ${c.label}`}
                  className={`h-9 w-9 rounded-full text-sm font-medium transition-colors ${
                    activeCertTab === c.number
                      ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                      : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                  }`}
                >
                  {c.number}
                </button>
              ))}
            </div>

            {activeCertificate && (
              <>
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-3">
                  {activeCertificate.label}
                </p>

                <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                  <Image
                    src={activeCertificate.file}
                    alt={activeCertificate.label}
                    fill
                    sizes="(min-width: 768px) 768px, 100vw"
                    className="object-contain"
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* deep-dive overlay */}
      {activeSegment && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-8 transition-opacity duration-300 ${
            overlayVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeOverlay}
          />

          <div
            className={`relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xl p-8 sm:p-14 transition-all duration-300 ease-out ${
              overlayVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
          >
            <button
              onClick={closeOverlay}
              aria-label="Close"
              className="absolute top-5 right-5 sm:top-8 sm:right-8 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <span className="text-7xl sm:text-8xl font-bold text-zinc-100 dark:text-zinc-900 select-none block leading-none">
              {String((expandedIndex ?? 0) + 1).padStart(2, "0")}
            </span>

            <h2 className="text-3xl sm:text-4xl font-bold -mt-8 sm:-mt-10 relative">
              {activeSegment.title}
            </h2>

            <p className="text-zinc-600 dark:text-zinc-400 mt-3 text-lg">
              {activeSegment.description}
            </p>

            {activeSegment.skills && (
              <div className="flex flex-wrap gap-2 mt-6">
                {activeSegment.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 rounded-full text-sm font-medium bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-8 pt-8 border-t border-zinc-200 dark:border-zinc-800">
              <p className="text-lg sm:text-xl leading-relaxed text-zinc-700 dark:text-zinc-300">
                {activeSegment.details ?? activeSegment.description}
              </p>
            </div>

            <div className="mt-10 flex items-center justify-between text-sm text-zinc-400">
              <button
                disabled={(expandedIndex ?? 0) === 0}
                onClick={() => setExpandedIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : prev))}
                className="disabled:opacity-30 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
              >
                ← Previous
              </button>
              <span>
                {String((expandedIndex ?? 0) + 1).padStart(2, "0")} / {String(cert.segments.length).padStart(2, "0")}
              </span>
              <button
                disabled={(expandedIndex ?? 0) === cert.segments.length - 1}
                onClick={() => setExpandedIndex((prev) => (prev !== null && prev < cert.segments.length - 1 ? prev + 1 : prev))}
                className="disabled:opacity-30 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}