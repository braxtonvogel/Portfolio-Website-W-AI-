"use client";

import { useCallback, useEffect, useState, type RefObject } from "react";

type Callbacks = {
  onFrame: (depth: number) => void;
  onFloorChange: (floor: number | null) => void;
};

/**
 * The scroll engine behind the descent: turns wheel / touch / keyboard input
 * into one continuous `depth` value that glides toward a target and snaps to
 * the nearest floor once input stops.
 *
 * Plain object, no React inside - every per-frame value lives here. The only
 * React state that comes out is `onFloorChange`, fired when the camera settles
 * near (or leaves) a floor. `onFrame` gets the raw depth every animation frame
 * and is expected to write styles directly (transform/opacity only).
 */
class DescentEngine {
  depth: number;
  target: number;
  restFloor: number;
  floor: number | null = null;
  raf = 0;
  lastTick = 0;
  snapTimer: ReturnType<typeof setTimeout> | null = null;
  reducedMotion = false;
  callbacks: Callbacks = { onFrame: () => {}, onFloorChange: () => {} };

  constructor(
    public min: number,
    public max: number
  ) {
    this.depth = min;
    this.target = min;
    this.restFloor = min;
  }

  configure(opts: { min: number; max: number; reducedMotion: boolean } & Callbacks) {
    this.min = opts.min;
    this.max = opts.max;
    this.reducedMotion = opts.reducedMotion;
    this.callbacks = { onFrame: opts.onFrame, onFloorChange: opts.onFloorChange };
  }

  clamp(v: number) {
    return Math.min(this.max, Math.max(this.min, v));
  }

  report(d: number) {
    this.callbacks.onFrame(d);
    const near = Math.round(d);
    const next = near >= 0 && Math.abs(d - near) < 0.35 ? near : null;
    if (next !== this.floor) {
      this.floor = next;
      this.callbacks.onFloorChange(next);
    }
  }

  tick = (now: number) => {
    this.raf = 0;
    const dt = Math.min(0.05, this.lastTick ? (now - this.lastTick) / 1000 : 1 / 60);
    this.lastTick = now;
    const gap = this.target - this.depth;
    if (Math.abs(gap) < 0.0006) {
      this.depth = this.target;
      this.lastTick = 0;
      this.report(this.depth);
      return;
    }
    // frame-rate independent exponential ease toward the target
    this.depth += gap * (1 - Math.exp(-dt * 7.5));
    this.report(this.depth);
    this.raf = requestAnimationFrame(this.tick);
  };

  kick() {
    if (this.reducedMotion) {
      this.depth = this.target;
      this.lastTick = 0;
      this.report(this.depth);
      return;
    }
    if (!this.raf) this.raf = requestAnimationFrame(this.tick);
  }

  goTo(f: number) {
    const t = this.clamp(Math.round(f));
    this.target = t;
    this.restFloor = t;
    this.clearSnap();
    this.kick();
  }

  clearSnap() {
    if (this.snapTimer) clearTimeout(this.snapTimer);
    this.snapTimer = null;
  }

  // After input goes quiet: one nudge in a direction always carries to the
  // next floor (never stranded between two), a bigger fling can skip several.
  scheduleSnap() {
    this.clearSnap();
    this.snapTimer = setTimeout(() => {
      this.snapTimer = null;
      const delta = this.target - this.restFloor;
      let next = this.restFloor;
      if (Math.abs(delta) > 0.06) {
        next = this.restFloor + Math.sign(delta) * Math.max(1, Math.round(Math.abs(delta)));
      }
      next = this.clamp(next);
      this.target = next;
      this.restFloor = next;
      this.kick();
    }, 140);
  }

  nudge(amount: number) {
    this.target = this.clamp(this.target + amount);
    this.kick();
    this.scheduleSnap();
  }

  dispose() {
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
    this.clearSnap();
  }
}

/** A panel with its own overflow keeps the wheel while it can still scroll in
 * that direction - only once it hits the end does the world take over. */
function panelWantsScroll(t: EventTarget | null, dy: number) {
  const panel = (t as HTMLElement | null)?.closest?.("[data-scrollpanel]") as HTMLElement | null;
  if (!panel || panel.scrollHeight <= panel.clientHeight + 1) return false;
  if (dy > 0) return panel.scrollTop + panel.clientHeight < panel.scrollHeight - 1;
  return panel.scrollTop > 0;
}

function isTyping(t: EventTarget | null) {
  const el = t as HTMLElement | null;
  if (!el) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable;
}

export function useDescent({
  containerRef,
  enabled,
  min,
  max,
  reducedMotion,
  onFrame,
  onFloorChange,
}: {
  containerRef: RefObject<HTMLElement | null>;
  enabled: boolean;
  min: number;
  max: number;
  reducedMotion: boolean;
} & Callbacks) {
  const [engine] = useState(() => new DescentEngine(min, max));

  // latest callbacks / flags, without restarting anything
  useEffect(() => {
    engine.configure({ min, max, reducedMotion, onFrame, onFloorChange });
  }, [engine, onFrame, onFloorChange, reducedMotion, min, max]);

  // initial pose, before any input
  useEffect(() => {
    engine.report(engine.depth);
  }, [engine]);

  useEffect(() => {
    const el = containerRef.current;
    if (!enabled || !el) return;

    const onWheel = (e: WheelEvent) => {
      if (panelWantsScroll(e.target, e.deltaY)) return;
      const unit = e.deltaMode === 1 ? 40 : e.deltaMode === 2 ? 800 : 1;
      engine.nudge((e.deltaY * unit) / 700);
    };

    let touchY: number | null = null;
    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0]?.clientY ?? null;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (touchY === null) return;
      const y = e.touches[0]?.clientY ?? touchY;
      const dy = touchY - y;
      touchY = y;
      if (panelWantsScroll(e.target, dy)) return;
      engine.nudge(dy / 500);
    };
    const onTouchEnd = () => {
      touchY = null;
    };

    const onKey = (e: KeyboardEvent) => {
      if (isTyping(e.target) || e.metaKey || e.ctrlKey || e.altKey) return;
      const at = engine.restFloor;
      switch (e.key) {
        case "ArrowDown":
        case "PageDown":
        case " ":
          e.preventDefault();
          engine.goTo(at + 1);
          break;
        case "ArrowUp":
        case "PageUp":
          e.preventDefault();
          engine.goTo(at - 1);
          break;
        case "Home":
          e.preventDefault();
          engine.goTo(engine.min);
          break;
        case "End":
          e.preventDefault();
          engine.goTo(engine.max);
          break;
      }
    };

    el.addEventListener("wheel", onWheel, { passive: true });
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: true });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("keydown", onKey);
    };
  }, [containerRef, enabled, engine]);

  useEffect(() => () => engine.dispose(), [engine]);

  const goTo = useCallback((f: number) => engine.goTo(f), [engine]);
  const getDepth = useCallback(() => engine.depth, [engine]);

  return { goTo, getDepth };
}
