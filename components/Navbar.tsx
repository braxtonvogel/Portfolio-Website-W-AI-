"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import styles from "./Navbar.module.css";

export type NavItem = {
  label: string;
  active?: boolean;
  /** A real route (surface pages). */
  href?: string;
  /** Or an action (the dive world drives its own camera instead of routing). */
  onClick?: () => void;
};

/**
 * The one site nav, shared by the dive world and the normal pages. A single
 * row everywhere: on phones it scrolls sideways (fading out at the edge) and
 * keeps the active item in view, instead of wrapping into two rows and
 * pushing the page down.
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
  brand,
  variant = "auto",
}: {
  items: NavItem[];
  brand?: { label: string; href?: string; onClick?: () => void };
  variant?: "dark" | "auto";
}) {
  const listRef = useRef<HTMLUListElement>(null);
  const activeIndex = items.findIndex((i) => i.active);

  // phones: if the active item is off the end of the row, scroll the row
  // just far enough to show it - not to center it, which would push the
  // first items (Home) out of view on a short list. Scrolls the list itself,
  // never the page - scrollIntoView on a fixed bar can yank the document too.
  useEffect(() => {
    const list = listRef.current;
    if (!list || activeIndex < 0 || list.scrollWidth <= list.clientWidth) return;
    const el = list.children[activeIndex] as HTMLElement | undefined;
    if (!el) return;
    const margin = 40; // keeps the item clear of the fade at the right edge
    // measured against the list's own scroll box - offsetLeft would be
    // relative to the fixed bar and include the brand's width
    const left = el.getBoundingClientRect().left - list.getBoundingClientRect().left + list.scrollLeft;
    const right = left + el.offsetWidth;
    if (right + margin > list.scrollLeft + list.clientWidth) {
      list.scrollTo({ left: right + margin - list.clientWidth, behavior: "smooth" });
    } else if (left < list.scrollLeft) {
      list.scrollTo({ left: Math.max(0, left - margin), behavior: "smooth" });
    }
  }, [activeIndex]);

  return (
    <nav aria-label="Primary" className={`${styles.bar} ${variant === "dark" ? styles.dark : styles.auto}`}>
      <div className={styles.inner}>
        {brand &&
          (brand.href ? (
            <Link href={brand.href} className={styles.brand}>
              {brand.label}
            </Link>
          ) : (
            <button type="button" onClick={brand.onClick} className={styles.brand}>
              {brand.label}
            </button>
          ))}
        <ul ref={listRef} className={styles.list}>
          {items.map((item) => (
            <li key={item.label}>
              {item.href ? (
                <Link href={item.href} className={`${styles.link} ${item.active ? styles.active : ""}`} aria-current={item.active ? "page" : undefined}>
                  {item.label}
                </Link>
              ) : (
                <button type="button" onClick={item.onClick} className={`${styles.link} ${item.active ? styles.active : ""}`} aria-current={item.active ? "true" : undefined}>
                  {item.label}
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
