"use client";

import Link, { type LinkProps } from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, type AnchorHTMLAttributes, type MouseEvent, type ReactNode } from "react";
import { usePrefersReducedMotion } from "@/lib/useMediaQuery";

type ViewTransition = { ready: Promise<void>; updateCallbackDone: Promise<void>; finished: Promise<void> };
type DocumentWithViewTransitions = Document & {
  startViewTransition?: (callback: () => void | Promise<void>) => ViewTransition;
};

type Props = LinkProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> & { children?: ReactNode };

// Module-level, not per-component: every ViewTransitionLink on the page
// shares one "is a doorway transition currently running" flag, so a click
// landing while the previous one is still wrapping up (its `finished`
// promise not yet settled) falls back to a plain, instant navigation instead
// of asking the browser to run two overlapping transitions - which is what
// was producing an intermittent "aborted because of timeout" console error
// on a quick back-and-forth between the dive world and a surface page.
let transitionInFlight = false;

/**
 * A drop-in `next/link` for the handful of "doorways" between the dive world
 * and the plain surface pages (certifications, early dev, project pages, and
 * their own "back" links) - every prop passes straight through to the real
 * `Link` (so styling, prefetching, etc. are unaffected), this only adds a
 * soft crossfade using the browser's native View Transitions API instead of
 * today's hard cut. See the `doorway-in`/`doorway-out` keyframes in
 * globals.css for the actual motion.
 *
 * Deliberately not built on Next's experimental view-transition integration:
 * this site is a static export, and hand-rolling the transition around the
 * router means it degrades to a perfectly normal `Link` on any browser
 * without the API (Firefox, older Safari) or with reduced motion requested,
 * with no separate code path to keep in sync.
 */
export default function ViewTransitionLink({ href, onClick, ...rest }: Props) {
  const router = useRouter();
  const reducedMotion = usePrefersReducedMotion();

  function handleClick(e: MouseEvent<HTMLAnchorElement>) {
    onClick?.(e);
    if (e.defaultPrevented) return;
    // modified clicks (open in new tab, etc.) and non-primary buttons should
    // behave exactly like a normal link
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

    const doc = document as DocumentWithViewTransitions;
    if (reducedMotion || !doc.startViewTransition || transitionInFlight) return;

    e.preventDefault();
    const dest = typeof href === "string" ? href : `${href.pathname ?? ""}${href.search ?? ""}${href.hash ?? ""}`;
    const destPath = dest.split(/[?#]/)[0];

    transitionInFlight = true;
    const vt = doc.startViewTransition(
      () =>
        new Promise<void>((resolve) => {
          startTransition(() => router.push(dest));
          // Polls via setTimeout, not requestAnimationFrame: rAF can be
          // starved for the whole wait (a backgrounded tab, a tab a
          // screenshot tool is driving without ever painting it) with
          // nothing left to even check the deadline, which would hang the
          // transition until the browser's own multi-second timeout fires
          // instead (a console error, no visible crossfade). setTimeout
          // still fires - throttled, worst case - so the deadline below is
          // always reachable. Polls for the URL actually landing, the real
          // signal the App Router's navigation has committed, since resolving
          // on a fixed delay could fire before an uncached route chunk has
          // actually painted.
          const deadline = performance.now() + 1500;
          const check = () => {
            if (location.pathname === destPath || performance.now() > deadline) resolve();
            else setTimeout(check, 16);
          };
          check();
        })
    );
    // `startViewTransition` hands back three independent promises
    // (`ready`/`updateCallbackDone`/`finished`), any of which can reject on
    // its own - each one with no handler attached is its own separate
    // "Uncaught (in promise)" console error, even though the navigation
    // itself has already happened by the time any of them settles. None of
    // the three are otherwise used here, so all three just get silenced.
    vt.ready.catch(() => {});
    vt.updateCallbackDone.catch(() => {});
    vt.finished.catch(() => {}).finally(() => {
      transitionInFlight = false;
    });
  }

  return <Link href={href} onClick={handleClick} {...rest} />;
}
