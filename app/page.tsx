"use client";

import { useEffect, useRef, useState } from "react";
import Nav from "@/components/dive/Nav";
import Welcome from "@/components/dive/Welcome";
import World from "@/components/dive/World";
import MobileSpace, { scrollToSection } from "@/components/dive/MobileSpace";
import { DiveOverlay, FlyPulse } from "@/components/dive/DiveOverlay";
import BootSequence from "@/components/dive/BootSequence";
import styles from "@/components/dive/dive.module.css";
import type { Section } from "@/components/dive/sections";
import { phrases } from "@/lib/portfolioData";
import { useIsMobile, usePrefersReducedMotion } from "@/lib/useMediaQuery";

type View = "welcome" | "space";

export default function Home() {
  const isMobile = useIsMobile();
  const reducedMotion = usePrefersReducedMotion();

  const [view, setView] = useState<View>("welcome");
  const [active, setActive] = useState<Section | null>(null);
  const [animating, setAnimating] = useState(false);
  const [overlayOn, setOverlayOn] = useState(false);
  const [overlayKey, setOverlayKey] = useState(0);
  const [welcomeClass, setWelcomeClass] = useState("");
  const [spaceClass, setSpaceClass] = useState("");
  const [hint, setHint] = useState(false);
  const [tilt, setTilt] = useState("rotateY(0deg) rotateX(0deg)");
  const [pulseOn, setPulseOn] = useState(false);
  const [pulseKey, setPulseKey] = useState(0);
  const [booting, setBooting] = useState(false);
  const [worldStart, setWorldStart] = useState(false);
  const bootDoneRef = useRef<() => void>(() => {});

  const [typed, setTyped] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const setTimer = (fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    timers.current.push(id);
    return id;
  };

  useEffect(() => {
    return () => timers.current.forEach(clearTimeout);
  }, []);

  // typewriter - only runs on the welcome screen. Left ungated, this was
  // re-rendering the whole tree (World and all 6 monoliths/panels included)
  // every 40-70ms for as long as the page stayed open, including all the way
  // through the dive-in assemble animation - on integrated graphics that
  // main-thread churn was enough to make the browser drop the monolith
  // reveal animation for some or all of them, which is why it only failed
  // "sometimes": it was racing against whenever a typewriter tick landed.
  useEffect(() => {
    if (view !== "welcome") return;
    const current = phrases[phraseIndex];
    const delay = deleting ? 40 : 70;

    const t = setTimeout(() => {
      if (!deleting) {
        if (typed.length < current.length) {
          setTyped(current.slice(0, typed.length + 1));
        } else {
          setTimeout(() => setDeleting(true), 1000);
        }
      } else {
        if (typed.length > 0) {
          setTyped(current.slice(0, typed.length - 1));
        } else {
          setDeleting(false);
          setPhraseIndex((p) => (p + 1) % phrases.length);
        }
      }
    }, delay);

    return () => clearTimeout(t);
  }, [typed, deleting, phraseIndex, view]);

  function fly(section: Section, force = false) {
    if (animating || view !== "space") return;
    const next = !force && active === section ? null : section;
    setActive(next);
    setHint(!next);
    // the mouse-follow tilt is frozen while a section is focused (see World's
    // handleMove) - reset it to dead-center so the camera settles cleanly
    // instead of holding whatever offset it had when the section was picked
    if (next) setTilt("rotateY(0deg) rotateX(0deg)");
    setPulseOn(true);
    setPulseKey((k) => k + 1);
    setTimer(() => setPulseOn(false), 750);
  }

  function dive(section: Section | null) {
    if (animating || view !== "welcome") return;
    setAnimating(true);

    if (reducedMotion) {
      setWelcomeClass(styles.fadeOut);
      setTimer(() => {
        setView("space");
        setActive(null);
        setSpaceClass(styles.fadeIn);
        setHint(false);
        setWelcomeClass("");
        setAnimating(false);
        if (isMobile && section) setTimer(() => scrollToSection(section), 50);
        else if (!isMobile && section) fly(section, true);
        else if (!isMobile) setHint(true);
      }, 200);
      return;
    }

    setOverlayOn(true);
    setOverlayKey((k) => k + 1);
    setWelcomeClass(styles.wOut);

    setTimer(() => {
      setView("space");
      setActive(null);
      setSpaceClass(styles.sIn);
      setHint(false);

      if (isMobile) {
        // the flat mobile fallback has no assembly choreography to hide behind
        // a loading screen - it's ready as soon as it fades in
        if (section) setTimer(() => scrollToSection(section), 50);
        return;
      }

      // the world is mounted now but held back from building (see World's
      // `start` prop) until the loading beat finishes - once it does, the
      // world starts its own entrance sequence, and only once THAT finishes
      // does the auto-fly/hint fire, so the camera never moves while things
      // are still assembling.
      bootDoneRef.current = () => {
        if (section) fly(section, true);
        else setHint(true);
      };
      setWorldStart(false);
      setBooting(true);
    }, 730);

    setTimer(() => {
      setOverlayOn(false);
      setAnimating(false);
      setWelcomeClass("");
    }, 1150);
  }

  function go(section: Section) {
    if (view === "welcome") {
      dive(section);
    } else if (isMobile) {
      scrollToSection(section);
    } else {
      fly(section, false);
    }
  }

  function goHome() {
    if (animating || view !== "space") return;
    setAnimating(true);

    if (reducedMotion) {
      setSpaceClass(styles.fadeOut);
      setHint(false);
      setTimer(() => {
        setView("welcome");
        setActive(null);
        setWelcomeClass(styles.fadeIn);
        setSpaceClass("");
        setAnimating(false);
      }, 200);
      return;
    }

    setOverlayOn(true);
    setOverlayKey((k) => k + 1);
    setSpaceClass(styles.sOut);
    setHint(false);

    setTimer(() => {
      setView("welcome");
      setActive(null);
      setWelcomeClass(styles.wIn);
    }, 730);

    setTimer(() => {
      setOverlayOn(false);
      setAnimating(false);
      setSpaceClass("");
    }, 1150);
  }

  function onTilt(dx: number, dy: number) {
    setTilt(`rotateY(${(dx * 4).toFixed(2)}deg) rotateX(${(-dy * 2.5).toFixed(2)}deg)`);
  }

  return (
    <main className="relative isolate overflow-hidden bg-black text-white min-h-[100dvh]">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-200px] left-[-150px] w-[700px] h-[700px] rounded-full bg-cyan-500/15 blur-[140px] animate-orb-1" />
        <div className="absolute bottom-[-100px] right-[-200px] w-[800px] h-[800px] rounded-full bg-blue-500/15 blur-[160px] animate-orb-2" />
        <div className="absolute top-[30%] left-[40%] w-[500px] h-[500px] rounded-full bg-cyan-300/10 blur-[120px] animate-orb-3" />
      </div>

      {view === "space" && <Nav active={active} onHome={goHome} onGo={go} />}

      {view === "welcome" && <Welcome typed={typed} welcomeClass={welcomeClass} onDive={() => dive(null)} />}

      {view === "space" &&
        (isMobile ? (
          <MobileSpace spaceClass={spaceClass} />
        ) : (
          <World
            spaceClass={spaceClass}
            active={active}
            hint={hint}
            tilt={tilt}
            reducedMotion={reducedMotion}
            start={worldStart}
            onSelect={(s) => fly(s, false)}
            onTilt={onTilt}
            onReady={() => bootDoneRef.current()}
          />
        ))}

      {overlayOn && <DiveOverlay key={`overlay-${overlayKey}`} />}
      {pulseOn && !isMobile && <FlyPulse key={`pulse-${pulseKey}`} />}
      {booting && (
        <BootSequence
          onDone={() => {
            setBooting(false);
            setWorldStart(true);
          }}
        />
      )}
    </main>
  );
}
