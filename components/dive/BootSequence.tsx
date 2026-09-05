"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./dive.module.css";

const MODULES = [
  "react", "next.js", "typescript", "python", "java",
  "machine learning", "sql", "playwright automation", "spring boot", "rust",
];

// self-contained fixed timeline: the world doesn't start assembling until
// this is done (see World's `start` prop), so this no longer needs to wait
// on or accommodate anything happening underneath it - just a clean, bounded
// loading beat before the world begins building.
const MIN_MS = 1200;
const MAX_MS = 2200;

// the name resolves out of "code" one character at a time, left to right -
// the boot-screen echo of the glyph rain on the certifications page. ASCII
// only: every glyph here has the same advance in the panel's monospace
// font, so the line never jitters in width as characters swap.
const NAME = "BRAXTON VOGEL";
const SCRAMBLE = "01<>/{}[]=+*#%&@?;:^~ABCDEFXYZ";
const RESOLVE_MS = 65; // per character - the whole name lands in ~850ms, inside MIN_MS

/** Shown once, right after diving in, before the world starts building
 * underneath it. Purely cosmetic - not a real progress bar - but bounded so
 * it can never overstay: it waits for document.fonts.ready up to MIN_MS,
 * then leaves, with MAX_MS as a hard ceiling regardless.
 *
 * `onLeaving` fires the moment the panel starts its fade-out; `onDone` fires
 * once it has finished. The world starts assembling on the first, not the
 * second, so it rises under the departing panel as a crossfade rather than
 * after a beat of black. */
export default function BootSequence({ onLeaving, onDone }: { onLeaving?: () => void; onDone: () => void }) {
  const [line, setLine] = useState(0);
  const [filled, setFilled] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const nameRef = useRef<HTMLParagraphElement>(null);
  const leavingRef = useRef(onLeaving);
  const doneRef = useRef(onDone);
  useEffect(() => {
    leavingRef.current = onLeaving;
    doneRef.current = onDone;
  }, [onLeaving, onDone]);

  useEffect(() => {
    const start = performance.now();

    // the fill bar is a single class flip into a CSS transition, not a
    // per-frame setState loop - a per-frame rAF+setState version here would
    // re-render React on every single frame for the entire boot duration,
    // competing with everything else on screen for main-thread time on
    // weaker hardware. One rAF just lets the un-filled state paint before the
    // transition (whose own duration is set from MIN_MS below) kicks in.
    const raf = requestAnimationFrame(() => setFilled(true));

    const cycle = setInterval(() => {
      setLine((i) => (i + 1) % MODULES.length);
    }, 130);

    // writes straight to the DOM node (no setState) at ~20 ticks/s for under
    // a second - deliberately no canvas or rain behind it: the world is about
    // to start assembling underneath, and this beat shouldn't cost it anything
    const nameEl = nameRef.current;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let scramble: ReturnType<typeof setInterval> | undefined;
    if (nameEl && !reduced) {
      const t0 = performance.now();
      const tick = () => {
        const resolved = Math.floor((performance.now() - t0) / RESOLVE_MS);
        let s = "";
        for (let i = 0; i < NAME.length; i++) {
          s += i < resolved || NAME[i] === " " ? NAME[i] : SCRAMBLE[(Math.random() * SCRAMBLE.length) | 0];
        }
        nameEl.textContent = s;
        if (resolved >= NAME.length) clearInterval(scramble);
      };
      tick();
      scramble = setInterval(tick, 50);
    }

    const fontsReady = typeof document !== "undefined" && "fonts" in document ? document.fonts.ready : Promise.resolve();
    const ready = Promise.race([fontsReady, new Promise((r) => setTimeout(r, MAX_MS))]);

    let leaveTimer: ReturnType<typeof setTimeout>;
    let doneTimer: ReturnType<typeof setTimeout>;
    ready.then(() => {
      const wait = Math.max(0, MIN_MS - (performance.now() - start));
      leaveTimer = setTimeout(() => {
        setLeaving(true);
        leavingRef.current?.();
        doneTimer = setTimeout(() => doneRef.current(), 260);
      }, wait);
    });

    return () => {
      cancelAnimationFrame(raf);
      clearInterval(cycle);
      if (scramble) clearInterval(scramble);
      clearTimeout(leaveTimer);
      clearTimeout(doneTimer);
    };
  }, []);

  return (
    <div className={`${styles.boot} ${leaving ? styles.bootLeaving : ""}`} role="status" aria-live="polite">
      <div className={styles.bootPanel}>
        <p className={styles.bootHeader}>Initializing experience</p>
        {/* server-rendered fully resolved, so reduced motion / no-JS see the name, not glyphs */}
        <p ref={nameRef} className={styles.bootName} aria-label={NAME}>
          {NAME}
        </p>
        <p className={styles.bootLine}>&gt; loading {MODULES[line]}</p>
        <div className={styles.bootBar}>
          <div
            className={`${styles.bootBarFill} ${filled ? styles.bootBarFilled : ""}`}
            style={{ transitionDuration: `${MIN_MS}ms` }}
          />
        </div>
      </div>
    </div>
  );
}
