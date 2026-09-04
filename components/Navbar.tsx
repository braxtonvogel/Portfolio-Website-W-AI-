"use client";

import ViewTransitionLink from "@/components/ViewTransitionLink";
import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/lib/useMediaQuery";
import styles from "./Navbar.module.css";

export type NavItem = {
  label: string;
  active?: boolean;
  /** A real route (surface pages) or a deep link into the dive world. */
  href?: string;
  /** Or an action (the dive world drives its own camera instead of routing). */
  onClick?: () => void;
};

/**
 * The one site nav, shared by the dive world and the normal pages.
 *
 * `pinned` (Home) always stays put, outside the scrollable strip - the rest
 * of `items` scrolls as one row, with arrow buttons at each end that page it
 * left/right (native touch-scroll still works too; the arrows are there for
 * anyone without a trackpad or the patience to swipe). Arrows hide
 * themselves once there's nothing further in that direction, so on a wide
 * enough screen where every item already fits, neither ever appears.
 *
 * No backdrop-filter: it sat over the WebGL city and the CSS 3D world, and a
 * full-screen-wide blur is one of the most expensive things a GPU can be
 * asked for every frame - a solid-enough gradient reads the same. That also
 * means nothing animating underneath (the world, the glyph rain on the
 * certifications page) ever bleeds through the labels.
 *
 * `variant="dark"` is the dive world (always dark); `"auto"` follows the OS
 * theme like the rest of the surface pages.
 */
export default function Navbar({
  items,
  pinned,
  brand,
  variant = "auto",
}: {
  items: NavItem[];
  /** Rendered right after the brand, never part of the scrollable/paged row. */
  pinned?: NavItem;
  brand?: { label: string; href?: string; onClick?: () => void };
  variant?: "dark" | "auto";
}) {
  const listRef = useRef<HTMLUListElement>(null);
  const activeIndex = items.findIndex((i) => i.active);
  const [canScroll, setCanScroll] = useState({ left: false, right: false });
  const reducedMotion = usePrefersReducedMotion();
  const scrollBehavior = reducedMotion ? "auto" : "smooth";

  const updateArrows = () => {
    const list = listRef.current;
    if (!list) return;
    const max = list.scrollWidth - list.clientWidth;
    const left = list.scrollLeft > 1;
    const right = list.scrollLeft < max - 1;
    setCanScroll({ left, right });
    // matches the arrows exactly - a side only ever fades when there's
    // actually more content past it, never just because the row happens to
    // scroll at all (see the .list rule in Navbar.module.css)
    list.style.setProperty("--fadeL", left ? "20px" : "0px");
    list.style.setProperty("--fadeR", right ? "20px" : "0px");
  };

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    updateArrows();
    const ro = new ResizeObserver(updateArrows);
    ro.observe(list);
    list.addEventListener("scroll", updateArrows, { passive: true });
    return () => {
      ro.disconnect();
      list.removeEventListener("scroll", updateArrows);
    };
  }, [items.length]);

  // if the active item is off the end of the row, scroll just far enough to
  // show it - not to center it, which would scroll a short list needlessly.
  // Scrolls the list itself, never the page - scrollIntoView on a fixed bar
  // can yank the document too.
  useEffect(() => {
    const list = listRef.current;
    if (!list || activeIndex < 0 || list.scrollWidth <= list.clientWidth) return;
    const el = list.children[activeIndex] as HTMLElement | undefined;
    if (!el) return;
    const margin = 40; // keeps the item clear of the arrow/fade at the edge
    const left = el.getBoundingClientRect().left - list.getBoundingClientRect().left + list.scrollLeft;
    const right = left + el.offsetWidth;
    if (right + margin > list.scrollLeft + list.clientWidth) {
      list.scrollTo({ left: right + margin - list.clientWidth, behavior: scrollBehavior });
    } else if (left < list.scrollLeft) {
      list.scrollTo({ left: Math.max(0, left - margin), behavior: scrollBehavior });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex]);

  const page = (dir: 1 | -1) => {
    const list = listRef.current;
    if (!list) return;
    list.scrollBy({ left: dir * list.clientWidth * 0.75, behavior: scrollBehavior });
  };

  const renderItem = (item: NavItem) =>
    item.href ? (
      <ViewTransitionLink href={item.href} className={`${styles.link} ${item.active ? styles.active : ""}`} aria-current={item.active ? "page" : undefined}>
        {item.label}
      </ViewTransitionLink>
    ) : (
      <button type="button" onClick={item.onClick} className={`${styles.link} ${item.active ? styles.active : ""}`} aria-current={item.active ? "true" : undefined}>
        {item.label}
      </button>
    );

  return (
    <nav aria-label="Primary" className={`${styles.bar} ${variant === "dark" ? styles.dark : styles.auto}`}>
      <div className={styles.inner}>
        {brand &&
          (brand.href ? (
            <ViewTransitionLink href={brand.href} className={styles.brand}>
              {brand.label}
            </ViewTransitionLink>
          ) : (
            <button type="button" onClick={brand.onClick} className={styles.brand}>
              {brand.label}
            </button>
          ))}
        {pinned && <div className={styles.pinned}>{renderItem(pinned)}</div>}
        <div className={styles.scrollWrap}>
          <button
            type="button"
            className={`${styles.arrow} ${styles.arrowLeft}`}
            onClick={() => page(-1)}
            aria-label="Scroll navigation left"
            hidden={!canScroll.left}
            tabIndex={canScroll.left ? 0 : -1}
          >
            <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M10 3 5 8l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <ul ref={listRef} className={styles.list}>
            {items.map((item) => (
              <li key={item.label}>{renderItem(item)}</li>
            ))}
          </ul>
          <button
            type="button"
            className={`${styles.arrow} ${styles.arrowRight}`}
            onClick={() => page(1)}
            aria-label="Scroll navigation right"
            hidden={!canScroll.right}
            tabIndex={canScroll.right ? 0 : -1}
          >
            <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
}
