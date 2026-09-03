"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import styles from "./dive.module.css";
import type { BackdropController } from "./backdropRenderer";

export type BackdropHandle = {
  /** 0 at the overview, 1 at the deepest floor - drives the city's rise and the water darkening. */
  setDescent(t: number): void;
};

/**
 * The Three.js sunken city that materializes behind the dive world.
 *
 * Sits between the star field and the CSS 3D stage, purely decorative
 * (`pointer-events: none`), and never blocks the rest of the page: the WebGL
 * module (three.js included) is pulled in with a dynamic import after mount,
 * and if the browser has no WebGL the component simply renders an empty
 * canvas and the existing CSS scene carries on unchanged.
 *
 * `start` kicks off the build-in (it plays once, after the loading screen
 * hands over - same moment the grid floor begins to grow). `dimmed` sinks the
 * city partly back into the water while a floor is in focus so the panel
 * stays legible. `setDescent` (via ref) is fed every frame by the descent.
 */
const Backdrop = forwardRef<BackdropHandle, { start: boolean; dimmed: boolean; reducedMotion: boolean }>(function Backdrop(
  { start, dimmed, reducedMotion },
  ref
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctrl = useRef<BackdropController | null>(null);
  // the renderer is mounted asynchronously - remember the latest values so it
  // starts in the right state whenever it does land
  const startRef = useRef(start);
  const dimmedRef = useRef(dimmed);
  const descentRef = useRef(0);

  useImperativeHandle(
    ref,
    () => ({
      setDescent(t: number) {
        descentRef.current = t;
        ctrl.current?.setDescent(t);
      },
    }),
    []
  );

  useEffect(() => {
    startRef.current = start;
    ctrl.current?.setStart(start);
  }, [start]);

  useEffect(() => {
    dimmedRef.current = dimmed;
    ctrl.current?.setDimmed(dimmed);
  }, [dimmed]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;

    import("./backdropRenderer")
      .then(({ mountBackdrop }) => {
        if (cancelled) return;
        ctrl.current = mountBackdrop(canvas, {
          reducedMotion,
          start: startRef.current,
          dimmed: dimmedRef.current,
          descent: descentRef.current,
        });
      })
      .catch(() => {
        // chunk failed to load (offline, blocked) - nothing to do, the CSS
        // scene is complete without us
      });

    return () => {
      cancelled = true;
      ctrl.current?.dispose();
      ctrl.current = null;
    };
  }, [reducedMotion]);

  return <canvas ref={canvasRef} className={styles.backdrop} aria-hidden="true" />;
});

export default Backdrop;
