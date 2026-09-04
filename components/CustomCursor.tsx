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

    // Batched to at most one style write per animation frame. mousemove can
    // fire well past 60/sec on a high-polling-rate mouse, and this page
    // already has other mousemove listeners doing real work of their own
    // (the dive world's parallax tilt, the WebGL backdrop's own parallax) -
    // writing to the DOM straight from the raw event, on top of that, was
    // extra main-thread work squeezed between frames rather than lined up
    // with them, which is what read as lag.
    let raf = 0;
    let x = 0;
    let y = 0;
    // Tracked as a flag (not "add the class once") so it can be hidden when
    // the pointer leaves the window or the window loses focus, and then
    // reliably shown again on the next move or click when it comes back.
    let visible = false;

    const applyPosition = () => {
      raf = 0;
      dot.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };
    const show = () => {
      if (visible) return;
      visible = true;
      dot.classList.add(styles.visible);
    };
    const hide = () => {
      if (!visible) return;
      visible = false;
      dot.classList.remove(styles.visible);
      dot.classList.remove(styles.down);
    };

    const onMove = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
      show();
      if (!raf) raf = requestAnimationFrame(applyPosition);
    };
    // the first event on the way back into the window can be the click
    // itself, with no move before it - make sure that click is visible too
    const onDown = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
      show();
      dot.classList.add(styles.down);
      if (!raf) raf = requestAnimationFrame(applyPosition);
    };
    const onUp = () => dot.classList.remove(styles.down);

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mousedown", onDown, { passive: true });
    window.addEventListener("mouseup", onUp, { passive: true });
    // clicking off to another window: hide, and drop any stuck "down" state
    window.addEventListener("blur", hide);
    document.addEventListener("mouseleave", hide);

    return () => {
      document.documentElement.classList.remove("customCursorActive");
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("blur", hide);
      document.removeEventListener("mouseleave", hide);
    };
  }, [hasFinePointer]);

  if (!hasFinePointer) return null;
  return <div ref={dotRef} className={styles.dot} aria-hidden="true" />;
}
