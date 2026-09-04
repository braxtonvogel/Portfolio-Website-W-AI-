"use client";

import { useEffect, useRef, useState } from "react";
import Nav from "@/components/dive/Nav";
import Welcome from "@/components/dive/Welcome";
import World, { type WorldHandle } from "@/components/dive/World";
import { DiveOverlay } from "@/components/dive/DiveOverlay";
import BootSequence from "@/components/dive/BootSequence";
import { moonOrigin } from "@/components/dive/NightSea";
import styles from "@/components/dive/dive.module.css";
import { SECTION_ORDER, type Section } from "@/components/dive/sections";

/** How long the moon gets to turn blue and burst its rings before the warp fires. */
const MOON_BEAT = 450;
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
  const [overlayOrigin, setOverlayOrigin] = useState<{ x: string; y: string } | undefined>(undefined);
  const [diving, setDiving] = useState(false);
  const [welcomeClass, setWelcomeClass] = useState("");
  const [spaceClass, setSpaceClass] = useState("");
  const [hint, setHint] = useState(false);
  const [tilt, setTilt] = useState("rotateY(0deg) rotateX(0deg)");
  const [booting, setBooting] = useState(false);
  const [worldStart, setWorldStart] = useState(false);
  const bootDoneRef = useRef<() => void>(() => {});
  const worldRef = useRef<WorldHandle>(null);

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

  // Deep links from outside the world (the standalone pages' nav, e.g.
  // "/#skills") land here as a hash on first load - dive straight to that
  // floor instead of requiring a click, the same as picking it from the nav.
  // Mount-only by design (empty deps): a later hash change while already in
  // the space shouldn't re-trigger a dive.
  useEffect(() => {
    const hash = window.location.hash.slice(1) as Section;
    if ((SECTION_ORDER as string[]).includes(hash)) dive(hash);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The world's WebGL backdrop (three.js included) lives in its own chunk that
  // is only imported once the world mounts. Fetch it while the welcome screen
  // sits idle so the dive never races the download - on a slow connection the
  // reveal could otherwise start late or be partly skipped.
  useEffect(() => {
    const w = window as Window & { requestIdleCallback?: (cb: () => void) => number; cancelIdleCallback?: (id: number) => void };
    const prefetch = () => {
      import("@/components/dive/backdropRenderer").catch(() => {});
    };
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(prefetch);
      return () => w.cancelIdleCallback?.(id);
    }
    const id = setTimeout(prefetch, 1500);
    return () => clearTimeout(id);
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

  /** Glide the desktop world to a section's floor. */
  function descendTo(section: Section) {
    worldRef.current?.goTo(SECTION_ORDER.indexOf(section));
  }

  // the world reports which floor the camera has settled on (null between
  // floors and at the overview) - that drives the nav highlight, and the
  // "scroll to descend" hint only shows while hanging at the overview
  function onFloorChange(section: Section | null) {
    setActive(section);
    setHint(section === null);
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
        if (section) setTimer(() => descendTo(section), 50);
        else setHint(true);
      }, 200);
      return;
    }

    // beat one: the moon turns blue and bursts its rings; beat two, MOON_BEAT
    // later: the full-frame warp fires from the moon and the welcome scales out
    setDiving(true);
    setOverlayOrigin(moonOrigin(isMobile));
    setTimer(() => {
      setOverlayOn(true);
      setOverlayKey((k) => k + 1);
      setWelcomeClass(styles.wOut);
    }, MOON_BEAT);

    setTimer(() => {
      setView("space");
      setActive(null);
      setSpaceClass(styles.sIn);
      setHint(false);
      setDiving(false);

      // the world is mounted now but held back from building (see World's
      // `start` prop) until the loading beat finishes - once it does, the
      // world starts its own entrance sequence, and only once THAT finishes
      // does the auto-descent/hint fire, so the camera never moves while
      // things are still assembling.
      bootDoneRef.current = () => {
        if (section) descendTo(section);
        else setHint(true);
      };
      setWorldStart(false);
      setBooting(true);
    }, MOON_BEAT + 730);

    setTimer(() => {
      setOverlayOn(false);
      setAnimating(false);
      setWelcomeClass("");
    }, MOON_BEAT + 1150);
  }

  function go(section: Section) {
    if (view === "welcome") dive(section);
    else descendTo(section);
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

    setOverlayOrigin(undefined);
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
      {view === "space" && <Nav active={active} onHome={goHome} onGo={go} />}

      {view === "welcome" && (
        <Welcome
          typed={typed}
          welcomeClass={welcomeClass}
          diving={diving}
          reducedMotion={reducedMotion}
          onDive={() => dive(null)}
        />
      )}

      {view === "space" && (
        <World
          ref={worldRef}
          spaceClass={spaceClass}
          floor={active}
          hint={hint}
          tilt={tilt}
          reducedMotion={reducedMotion}
          mobile={isMobile}
          start={worldStart}
          onFloorChange={onFloorChange}
          onTilt={onTilt}
          onReady={() => bootDoneRef.current()}
        />
      )}

      {overlayOn && <DiveOverlay key={`overlay-${overlayKey}`} origin={overlayOrigin} />}
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
