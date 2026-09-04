"use client";

import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/lib/useMediaQuery";

// a mix of the characters the "floating code" reads as - digits, a little
// katakana and braille, some math - drawn on a canvas, so a missing glyph in
// one font never shifts layout the way it would in text
const GLYPHS = "01アイウエオカキクケコサシスセソ⠁⠃⠇⠏⠟⠿◇△▽λΣΔΩ≈∞{}[]<>/=+*#";
const FRAME_MS = 1000 / 20;
/** Half-resolution canvas px between glyphs down a column. */
const CELL = 14;
/** Half-resolution canvas px between columns (44 CSS px - sparse on purpose). */
const COL_W = 22;

type Col = { x: number; y: number; next: number; v: number; a: number; wait: number };

/**
 * Glyphs sinking slowly down the whole page background, like marine snow -
 * the "floating code" from the reference, dialed down to ambience: sparse
 * columns, each glyph only every second or two, long soft fades, no
 * flicker. Fixed to the viewport so its cost never grows with the page.
 *
 * Kept cheap on purpose (it shares a screen with real content): a
 * half-resolution canvas, 20fps, a few dozen fillText calls per frame, and
 * nothing at all while the tab is hidden. Reduced motion draws one still
 * frame. Follows the OS light/dark theme so it reads on both grounds.
 */
export default function GlyphRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const darkMql = window.matchMedia("(prefers-color-scheme: dark)");
    let dark = darkMql.matches;
    let cols: Col[] = [];
    let w = 0,
      h = 0,
      raf = 0,
      last = 0;

    // cyan on black; on the light page a deep teal at lower alpha, so the
    // glyphs stay a texture behind the cards rather than competing with them
    const color = (a: number) => (dark ? `rgba(103,232,249,${(a * 0.75).toFixed(3)})` : `rgba(14,116,144,${(a * 0.45).toFixed(3)})`);
    const glyph = () => GLYPHS[(Math.random() * GLYPHS.length) | 0];

    const spawn = (c: Col, fresh: boolean) => {
      // fresh columns start scattered down the frame so the first frame
      // isn't a bare top edge; recycled ones re-enter from above after a rest
      c.y = fresh ? Math.random() * h : -CELL * (2 + Math.random() * 10);
      c.next = c.y;
      // cells per second - a glyph lands every 1-3s, ~10-25 CSS px/s of fall
      c.v = 0.35 + Math.random() * 0.55;
      c.a = 0.3 + Math.random() * 0.7;
      c.wait = fresh ? (Math.random() < 0.4 ? Math.random() * 8 : 0) : 1 + Math.random() * 6;
    };

    const fit = () => {
      // half resolution: soft, low-alpha glyphs don't need more, and this
      // shades a quarter of the pixels
      w = Math.max(1, Math.floor(canvas.clientWidth / 2));
      h = Math.max(1, Math.floor(canvas.clientHeight / 2));
      canvas.width = w;
      canvas.height = h;
      cols = [];
      for (let x = 6; x < w; x += COL_W) {
        const c: Col = { x, y: 0, next: 0, v: 0, a: 0, wait: 0 };
        spawn(c, true);
        cols.push(c);
      }
    };

    const setFont = () => {
      // canvas px are half CSS px here, so this is a 14px glyph on screen
      ctx.font = "7px ui-monospace, Menlo, Consolas, monospace";
      ctx.textBaseline = "top";
    };

    // dt in seconds
    const step = (dt: number) => {
      // fade everything already drawn a little - this is the trail, and it's
      // what makes a glyph sink rather than blink
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = `rgba(0,0,0,${Math.min(1, dt * 0.7).toFixed(3)})`;
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = "source-over";
      setFont();
      for (const c of cols) {
        if (c.wait > 0) {
          c.wait -= dt;
          continue;
        }
        c.y += c.v * CELL * dt;
        // a new glyph only as the head crosses into the next cell - between
        // cells nothing is drawn, the previous one just fades
        while (c.y >= c.next) {
          ctx.fillStyle = color(c.a);
          ctx.fillText(glyph(), c.x, c.next);
          c.next += CELL;
        }
        if (c.y > h + CELL) spawn(c, false);
      }
    };

    const still = () => {
      ctx.clearRect(0, 0, w, h);
      setFont();
      for (const c of cols) {
        if (c.wait > 0) continue;
        for (let y = c.y % (CELL * 4); y < h; y += CELL * (3 + Math.random() * 5)) {
          ctx.fillStyle = color(c.a * (0.2 + Math.random() * 0.5));
          ctx.fillText(glyph(), c.x, y);
        }
      }
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (document.hidden || now - last < FRAME_MS) return;
      // clamp so a background tab coming back doesn't dump one huge step
      const dt = last ? Math.min(0.1, (now - last) / 1000) : FRAME_MS / 1000;
      last = now;
      step(dt);
    };

    const onTheme = () => {
      dark = darkMql.matches;
      ctx.clearRect(0, 0, w, h);
      if (reducedMotion) still();
    };
    darkMql.addEventListener("change", onTheme);

    fit();
    const ro = new ResizeObserver(() => {
      fit();
      if (reducedMotion) still();
    });
    ro.observe(canvas);

    if (reducedMotion) still();
    else raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      darkMql.removeEventListener("change", onTheme);
    };
  }, [reducedMotion]);

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none" aria-hidden="true">
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
}
