"use client";

import ViewTransitionLink from "@/components/ViewTransitionLink";
import { Fragment, useLayoutEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { motion } from "framer-motion";
import styles from "../taskflow/taskflow.module.css";
import o from "./octopus.module.css";

export const LIVE_URL = "https://notes-app.greencliff-e1505168.westus2.azurecontainerapps.io";

// Local copies of TaskFlow's two reveal helpers (they aren't exported there,
// and copying them keeps that page untouched). Same values exactly.
export function fadeUp(reduced: boolean, delay = 0) {
  return {
    initial: { opacity: 0, y: reduced ? 0 : 28 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.35 },
    transition: reduced
      ? { duration: 0.2 }
      : { duration: 0.6, delay, ease: [0.2, 0.8, 0.2, 1] as const },
  };
}

export function dropBg(reduced: boolean, background: string) {
  return {
    initial: { opacity: 0, y: reduced ? 0 : -48 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.15 },
    transition: reduced ? { duration: 0.2 } : { duration: 0.7, ease: [0.2, 0.8, 0.2, 1] as const },
    style: { background },
    className: styles.chapterBg,
  };
}

/* ================= CARD CONTENT (S4-S9) ================= */

/** A plain element on the flip path (the flip is the motion there); the
 * TaskFlow reduced-motion reveal in the stacked fallback. */
function Reveal({
  on,
  tag = "div",
  delay = 0,
  className,
  children,
}: {
  on: boolean;
  tag?: "p" | "div";
  delay?: number;
  className?: string;
  children: ReactNode;
}) {
  if (tag === "p") {
    return on ? (
      <motion.p {...fadeUp(true, delay)} className={className}>
        {children}
      </motion.p>
    ) : (
      <p className={className}>{children}</p>
    );
  }
  return on ? (
    <motion.div {...fadeUp(true, delay)} className={className}>
      {children}
    </motion.div>
  ) : (
    <div className={className}>{children}</div>
  );
}

function Body({ on, children }: { on: boolean; children: ReactNode }) {
  return (
    <Reveal on={on} tag="p" className={`${styles.body} ${o.body}`}>
      {children}
    </Reveal>
  );
}

function Items({ on, items }: { on: boolean; items: ReactNode[] }) {
  return (
    <div className={styles.skillsGrid}>
      {items.map((item, i) => (
        <Reveal key={i} on={on} delay={(i % 4) * 0.06} className={styles.skillItem}>
          <span>▸</span>
          <span>{item}</span>
        </Reveal>
      ))}
    </div>
  );
}

const PROBLEMS: ReactNode[] = [
  "East US blocked creating the Azure SQL server, so the server was created in Central US.",
  "An Entra-only server couldn’t take the app’s connection, so it was recreated with SQL authentication plus Entra.",
  "GitHub Actions did not detect the workflow until the Dockerfile and the workflow file were moved to the repo root.",
  <Fragment key="feed">
    The Octopus GHCR feed needed a token with <code className={o.plainCode}>read:packages</code> before it could pull
    the image.
  </Fragment>,
  <Fragment key="step">
    Octopus has no built-in Azure Container Apps step, so a script step runs{" "}
    <code className={o.plainCode}>az containerapp update</code>.
  </Fragment>,
  "The Windows dynamic worker has no bash, so that script runs in PowerShell. Retries reuse the old process snapshot, so a fresh release had to be created.",
];

const COSTS: ReactNode[] = [
  "Azure SQL Database uses the free offer, set to auto-pause when it hits its limit.",
  "Azure Container Apps runs on the Consumption plan at 0.25 CPU and 0.5 Gi, and scales to zero replicas when idle.",
  "Images are stored in GHCR, which is free for public images, instead of Azure Container Registry at about $5 a month.",
  "CI/CD uses the Octopus Cloud free tier and GitHub Actions free minutes.",
  "A $5 monthly Azure budget alert is the safety net.",
];

type Card = { kicker: string; title: string; tint: string; content: (on: boolean) => ReactNode };

const CARDS: Card[] = [
  {
    kicker: "Build",
    title: "GitHub Actions to GHCR",
    tint: "var(--panel-endpoints)",
    content: (on) => (
      <Body on={on}>
        On each commit, a GitHub Actions workflow builds the container image and pushes it to the GitHub Container
        Registry (GHCR). The image in GHCR is what Octopus Deploy releases in the next step.
      </Body>
    ),
  },
  {
    kicker: "Release",
    title: "Octopus Deploy to Azure Container Apps",
    tint: "var(--panel-notes)",
    content: (on) => (
      <Body on={on}>
        Octopus Deploy creates a release from the image in GHCR and deploys it to Azure Container Apps. Build and
        release stay as separate steps, so a deploy does not require a new image build.
      </Body>
    ),
  },
  {
    kicker: "Live",
    title: "The running app",
    tint: "var(--panel-skills)",
    content: (on) => (
      <>
        <Body on={on}>The Container App is publicly reachable at this URL.</Body>
        <Reveal on={on} tag="p" className={`${styles.body} ${o.urlLine}`}>
          <a href={LIVE_URL} target="_blank" rel="noopener noreferrer" className={o.focusRing}>
            <code>{LIVE_URL}</code>
          </a>
        </Reveal>
        <Reveal on={on} className={styles.linkRow}>
          <a
            href={LIVE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.btnGhost} ${o.focusRing}`}
          >
            <span className={`${styles.dot} ${o.dot}`} aria-hidden="true" /> Live app
          </a>
        </Reveal>
      </>
    ),
  },
  {
    kicker: "Problems Solved",
    title: "What this pipeline had to get right",
    tint: "var(--panel-notes)",
    content: (on) => (
      <>
        <Body on={on}>
          Getting from a commit to a live Container App meant fixing the database region, the login model, the
          workflow path, the registry feed, and the deploy step.
        </Body>
        <Items on={on} items={PROBLEMS} />
      </>
    ),
  },
  {
    kicker: "Cost",
    title: "Keeping costs at $0",
    tint: "var(--panel-overview)",
    content: (on) => (
      <>
        <Body on={on}>The whole path stays on free tiers, with a budget alert as a safety net.</Body>
        <Items on={on} items={COSTS} />
      </>
    ),
  },
  {
    kicker: "Mentor",
    title: "With thanks",
    tint: "var(--panel-overview)",
    content: (on) => (
      <>
        <Body on={on}>This work was done with mentorship from Jeffrey Palermo.</Body>
        <Reveal on={on} className={styles.linkRow}>
          <ViewTransitionLink href="/early-development" className={`${styles.btnPrimary} ${o.focusRing}`}>
            Back to Early Dev
          </ViewTransitionLink>
          <ViewTransitionLink href="/" className={`${styles.btnGhost} ${o.focusRing}`}>
            Back to Home
          </ViewTransitionLink>
        </Reveal>
      </>
    ),
  },
];

/* ================= FLIP MATH ================= */

const N = CARDS.length; // 6
const LAST = N - 1;
const HOLD = 0.4; // first 40% of each card's sixth: at rest
const STACK = 6; // px each buried card sits below the one above it
const PEEK = STACK * LAST; // 30
const SNAPS = [0, 1, 2, 3, 4, 5, 6];

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const fx = (v: number) => v.toFixed(3);

/** cubic-bezier(x1, y1, x2, y2) as a function of x - Newton's method on the
 * curve's x polynomial, then evaluate y. */
function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 8; i++) {
      const mt = 1 - t;
      const xEst = 3 * mt * mt * t * x1 + 3 * mt * t * t * x2 + t * t * t;
      const dx = 3 * mt * mt * x1 + 6 * mt * t * (x2 - x1) + 3 * t * t * (1 - x2);
      if (Math.abs(dx) < 1e-6) break;
      t = clamp01(t - (xEst - x) / dx);
    }
    const mt = 1 - t;
    return 3 * mt * mt * t * y1 + 3 * mt * t * t * y2 + t * t * t;
  };
}
const EASE = cubicBezier(0.2, 0.8, 0.2, 1);

/** The front card lifting off the pad. rotateX is POSITIVE: with the pivot on
 * the top edge, a positive angle brings the bottom edge toward the viewer
 * (+z) and then up and over - never back and away. */
function lift(e: number, phone: boolean) {
  return phone
    ? `translateY(${fx(-32 * e)}px) rotateX(${fx(70 * e)}deg)`
    : `translateY(${fx(-48 * e)}px) rotateZ(${fx(-5 * e)}deg) rotateX(${fx(100 * e)}deg)`;
}

/* ================= DEFAULT PATH: STICKY FLIP ================= */

function FlipStage() {
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const track = trackRef.current;
    const stage = stageRef.current;
    if (!track || !stage) return;
    const cards = Array.from(stage.querySelectorAll<HTMLElement>("[data-card]"));
    const measures = Array.from(stage.querySelectorAll<HTMLElement>("[data-measure]"));
    if (cards.length !== N || measures.length !== N) return;

    const phoneMq = window.matchMedia("(max-width: 768px)");
    let phone = phoneMq.matches;
    let top = phone ? 68 : 80;
    let range = 0; // R: how far the stage stays stuck
    let front = 0;
    let flipping = false;
    let raf = 0;
    // last value written per card, so a frame only touches what changed
    const written = cards.map(() => ({ transform: "", opacity: "", zIndex: "", pointerEvents: "" }));

    // Shared card height = tallest card + the 30px of stack peeking below it,
    // capped to the room under the sticky top (the card's inner then scrolls).
    // The track's height is fixed in vh, so changing this never moves anything
    // that comes after the track.
    const measure = () => {
      phone = phoneMq.matches;
      top = phone ? 68 : 80;
      const inner = measures[0].parentElement;
      const cs = inner ? getComputedStyle(inner) : null;
      const pad = cs ? parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom) : 0;
      let tallest = 0;
      for (const m of measures) tallest = Math.max(tallest, m.offsetHeight);
      const cap = window.innerHeight - top - 16;
      const h = Math.max(PEEK, Math.min(tallest + pad + PEEK, cap));
      track.style.setProperty("--flip-card-h", `${h}px`);
      range = track.offsetHeight - stage.offsetHeight;
    };

    const apply = () => {
      raf = 0;
      const p = range > 0 ? clamp01((top - track.getBoundingClientRect().top) / range) : 0;
      const f = Math.min(LAST, Math.floor(p * N));
      const t = p * N - f;
      // 40% hold, 60% flip; the last card never flips away
      const u = f === LAST ? 0 : clamp01((t - HOLD) / (1 - HOLD));
      const e = EASE(u);
      front = f;
      flipping = u > 0;

      for (let i = 0; i < N; i++) {
        let transform: string;
        let opacity = "1";
        let zIndex = String(N - i);
        let pointerEvents = "none";
        if (i < f) {
          // already lifted off: rests at the end of its flip, hidden visually
          // only (still in the DOM and the accessibility tree)
          transform = lift(1, phone);
          opacity = "0";
        } else if (i === f) {
          transform = lift(e, phone);
          const op = Math.max(0, 1 - (e - 0.4) / 0.45);
          opacity = fx(op);
          zIndex = "20"; // above the whole stack for the entire swing
          pointerEvents = op < 0.05 ? "none" : "auto";
        } else if (i === f + 1) {
          transform = `translateY(${fx(STACK * (1 - e))}px) scale(${fx(0.96 + 0.04 * e)})`;
        } else {
          transform = `translateY(${STACK * (i - f)}px) scale(0.96)`;
        }

        const card = cards[i];
        const w = written[i];
        if (w.transform !== transform) card.style.transform = w.transform = transform;
        if (w.opacity !== opacity) card.style.opacity = w.opacity = opacity;
        if (w.zIndex !== zIndex) card.style.zIndex = w.zIndex = zIndex;
        if (w.pointerEvents !== pointerEvents) card.style.pointerEvents = w.pointerEvents = pointerEvents;
        card.classList.toggle(o.isActive, i === f);
      }
    };

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const remeasure = () => {
      measure();
      schedule();
    };

    // Tabbing (or clicking) into a card brings the track to that card's hold
    // start, so it's the one at rest on top.
    const onFocusIn = (ev: FocusEvent) => {
      const el = ev.target instanceof Element ? ev.target.closest("[data-card]") : null;
      if (!el) return;
      const i = Number(el.getAttribute("data-card"));
      if (Number.isNaN(i) || (i === front && !flipping)) return;
      const trackDocTop = track.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: trackDocTop - top + (i / N) * range + 1, behavior: "smooth" });
    };

    measure();
    apply();

    const ro = new ResizeObserver(remeasure);
    measures.forEach((m) => ro.observe(m));
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", remeasure);
    track.addEventListener("focusin", onFocusIn);

    // proximity snap to the hold starts, on the document scroller, only while
    // this stage is mounted
    const scroller = document.documentElement;
    const prevSnap = scroller.style.scrollSnapType;
    scroller.style.scrollSnapType = "y proximity";

    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", remeasure);
      track.removeEventListener("focusin", onFocusIn);
      scroller.style.scrollSnapType = prevSnap;
      track.style.removeProperty("--flip-card-h");
      for (const card of cards) {
        card.style.transform = "";
        card.style.opacity = "";
        card.style.zIndex = "";
        card.style.pointerEvents = "";
        card.classList.remove(o.isActive);
      }
    };
  }, []);

  return (
    <div ref={trackRef} className={o.flipTrack}>
      <div ref={stageRef} className={o.flipStage}>
        {CARDS.map((card, i) => (
          <section
            key={card.kicker}
            data-card={i}
            className={`${styles.chapter} ${o.flipCard}`}
            style={{ "--i": i, "--flip-tint": card.tint } as CSSProperties}
          >
            <div className={`${styles.chapterBg} ${o.flipBg}`} />
            <div className={`${styles.chapterInner} ${o.flipInner}`}>
              <div data-measure="">
                <div className={o.flipHead}>
                  <span className={styles.kicker}>{card.kicker}</span>
                  <h2 className={styles.chapterTitle}>{card.title}</h2>
                </div>
                {card.content(false)}
              </div>
            </div>
          </section>
        ))}
      </div>
      <div className={o.flipSnaps} aria-hidden="true">
        {SNAPS.map((k) => (
          <div key={k} className={o.flipSnap} style={{ "--k": k } as CSSProperties} />
        ))}
      </div>
    </div>
  );
}

/* ================= REDUCED MOTION: PLAIN STACKED CHAPTERS ================= */

function StackedChapters() {
  return (
    <>
      {CARDS.map((card) => (
        <section key={card.kicker} className={styles.chapter}>
          <motion.div {...dropBg(true, card.tint)} />
          <div className={styles.chapterInner}>
            <span className={styles.kicker}>{card.kicker}</span>
            <h2 className={styles.chapterTitle}>{card.title}</h2>
            {card.content(true)}
          </div>
        </section>
      ))}
    </>
  );
}

/** S4-S9. Two different component types, so switching between them remounts
 * the subtree and the flip's effect cleans up after itself. */
export default function FlipStack({ reduced }: { reduced: boolean }) {
  return reduced ? <StackedChapters /> : <FlipStage />;
}
