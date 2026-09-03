"use client";

import { useEffect, useRef } from "react";
import { useHasFinePointer } from "@/lib/useMediaQuery";
import styles from "./CustomCursor.module.css";

/**
 * Replaces the OS cursor with a translucent black-and-grey ring that
 * tracks the real pointer 1:1, and turns briefly less see-through on
 * mousedown, settling back to its resting transparency on mouseup.
 *
 * Mouse/trackpad only (`pointer: fine`) - on touch there's no persistent
 * cursor to replace, so this renders nothing there. The native cursor is
 * only hidden once this has actually mounted and confirmed that (via a
 * class on <html>, see globals.css), so a slow load or JS failure never
 * leaves the page with no visible cursor at all.
 */
export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const hasFinePointer = useHasFinePointer();

  useEffect(() => {
    if (!hasFinePointer) return;
    const dot = dotRef.current;
    if (!dot) return;

    document.documentElement.classList.add("customCursorActive");

    const onMove = (e: MouseEvent) => {
      dot.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      dot.classList.add(styles.visible);
    };
    const onDown = () => dot.classList.add(styles.down);
    const onUp = () => dot.classList.remove(styles.down);
    // don't leave it stuck mid-click if the pointer wanders off-window
    const onLeave = () => dot.classList.remove(styles.visible);

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mousedown", onDown, { passive: true });
    window.addEventListener("mouseup", onUp, { passive: true });
    window.addEventListener("blur", onUp);
    document.addEventListener("mouseleave", onLeave);

    return () => {
      document.documentElement.classList.remove("customCursorActive");
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("blur", onUp);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, [hasFinePointer]);

  if (!hasFinePointer) return null;
  return <div ref={dotRef} className={styles.dot} aria-hidden="true" />;
}
