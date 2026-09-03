"use client";

import { useEffect, useRef } from "react";
import styles from "./dive.module.css";
import { useIsMobile } from "@/lib/useMediaQuery";

/** Where the moon hangs on the welcome screen - dead center, sitting on the
 * horizon so its lower part is behind the sea, and the blue moon and the dive
 * warp burst from the middle of the screen. Same spot on a phone, just a
 * smaller disc (see .nightMobile). */
export const MOON = { x: 0.5, y: 0.555 };
export const MOON_MOBILE = { x: 0.5, y: 0.555 };
export const moonOrigin = (mobile: boolean) => {
  const m = mobile ? MOON_MOBILE : MOON;
  return { x: `${m.x * 100}%`, y: `${m.y * 100}%` };
};
/** Fraction of the height where the sky meets the sea. */
const HORIZON = 0.58;
const FRAME_MS = 1000 / 30;

/**
 * The welcome screen's setting: a still night over a mostly calm sea, under
 * a moon. Sky, stars, moon and sea are CSS; the moonlight path shimmering on
 * the water is a small half-resolution canvas at 30fps.
 *
 * `moonBlue` crossfades the moon to a blue moon and `rings` mounts the blue
 * ripple rings bursting out of it - both flip the moment Dive is pressed.
 */
export default function NightSea({
  moonBlue,
  rings,
  reducedMotion,
}: {
  moonBlue: boolean;
  rings: boolean;
  reducedMotion: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isMobile = useIsMobile();
  const moon = isMobile ? MOON_MOBILE : MOON;
  const origin = moonOrigin(isMobile);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const MOON_X = moon.x;

    let raf = 0;
    let last = 0;
    let w = 0,
      h = 0;

    const fit = () => {
      // half resolution: the glitter is soft by design and this shades a
      // quarter of the pixels
      w = Math.max(1, Math.floor(canvas.clientWidth / 2));
      h = Math.max(1, Math.floor(canvas.clientHeight / 2));
      canvas.width = w;
      canvas.height = h;
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      const horizon = h * HORIZON;
      const mx = w * MOON_X;

      // long, slow swells: a few faint lines rolling across the whole width
      ctx.lineWidth = 1;
      for (let k = 0; k < 4; k++) {
        const y0 = horizon + h * (0.09 + k * 0.17);
        const amp = 1.2 + k * 0.9;
        const len = 140 + k * 60;
        ctx.strokeStyle = `rgba(170, 200, 240, ${0.05 + k * 0.012})`;
        ctx.beginPath();
        for (let x = 0; x <= w; x += 6) {
          const y = y0 + Math.sin((x / len) * Math.PI * 2 + t * 0.35 + k * 1.3) * amp;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // the moonlight path: short horizontal glints in a cone under the moon,
      // denser and brighter toward the horizon, jittering on two slow sines
      const rows = 60;
      for (let i = 0; i < rows; i++) {
        const f = i / rows;
        const y = horizon + Math.pow(f, 1.25) * (h - horizon);
        const halfW = w * (0.015 + 0.13 * f);
        const glints = 1 + Math.floor(f * 3);
        for (let g = 0; g < glints; g++) {
          const seed = i * 7.31 + g * 3.7;
          const jitter = Math.sin(t * 0.6 + seed) * 0.7 + Math.sin(t * 1.3 + seed * 1.9) * 0.3;
          const x = mx + jitter * halfW;
          const len = (4 + 26 * f) * (0.6 + 0.4 * Math.abs(Math.sin(seed)));
          const a = (0.12 + 0.3 * (1 - f)) * (0.35 + 0.65 * Math.abs(Math.sin(t * 1.1 + seed * 2.3)));
          ctx.strokeStyle = `rgba(215, 228, 255, ${a.toFixed(3)})`;
          ctx.beginPath();
          ctx.moveTo(x - len / 2, y);
          ctx.lineTo(x + len / 2, y);
          ctx.stroke();
        }
      }
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (document.hidden || now - last < FRAME_MS) return;
      last = now;
      draw(now / 1000);
    };

    fit();
    const ro = new ResizeObserver(() => {
      fit();
      draw(performance.now() / 1000);
    });
    ro.observe(canvas);

    if (reducedMotion) draw(0);
    else raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [reducedMotion, moon.x]);

  return (
    <div
      className={`${styles.night} ${isMobile ? styles.nightMobile : ""}`}
      aria-hidden="true"
      style={{ "--moonX": origin.x, "--moonY": origin.y } as React.CSSProperties}
    >
      <div className={styles.nightSky} />
      <div className={styles.nightStars} />
      <div className={`${styles.moon} ${moonBlue ? styles.moonIsBlue : ""}`}>
        <div className={styles.moonHalo} />
        <div className={styles.moonDisc} />
        <div className={styles.moonBlueLayer} />
      </div>
      <div className={styles.nightSea} />
      <canvas ref={canvasRef} className={styles.glitter} />
      <div className={styles.horizonGlow} />
      {rings && (
        <div className={styles.moonRings}>
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="ripple-ring"
              style={{ animationDelay: `${i * 0.16}s`, animationDuration: "1.7s", borderColor: "rgba(96,165,250,0.7)" }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
