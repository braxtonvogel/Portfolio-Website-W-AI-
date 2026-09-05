import { useSyncExternalStore } from "react";

// One MediaQueryList + one stable subscribe/getSnapshot pair per query
// string, shared across every component that watches the same query.
// useSyncExternalStore tears down and re-subscribes whenever `subscribe`'s
// identity changes, and re-checks `getSnapshot` for tearing on every
// render - both were previously fresh closures (and getSnapshot a fresh
// MediaQueryList) on every single render of every consumer. The dive
// world's Skills/Projects/Certifications panels alone mount ~50 components
// that call these hooks, all simultaneously.
//
// `entryFor` itself runs unconditionally on every render, including on the
// server - so it must never touch `window` directly (an earlier version of
// this that called window.matchMedia() there broke server rendering with
// "window is not defined"). The actual MediaQueryList is created inside
// `getMql`, which is only ever invoked from within `subscribe`/`getSnapshot`
// - and those are only ever called by useSyncExternalStore on the client
// (the server uses getServerSnapshot instead), exactly like the original,
// uncached version deferred it.
const mqlCache = new Map<string, MediaQueryList>();
function getMql(query: string): MediaQueryList {
  let mql = mqlCache.get(query);
  if (!mql) {
    mql = window.matchMedia(query);
    mqlCache.set(query, mql);
  }
  return mql;
}

const entryCache = new Map<string, { subscribe: (onChange: () => void) => () => void; getSnapshot: () => boolean }>();

function entryFor(query: string) {
  let entry = entryCache.get(query);
  if (!entry) {
    entry = {
      subscribe: (onChange) => {
        const mql = getMql(query);
        mql.addEventListener("change", onChange);
        return () => mql.removeEventListener("change", onChange);
      },
      getSnapshot: () => getMql(query).matches,
    };
    entryCache.set(query, entry);
  }
  return entry;
}

const getServerSnapshot = () => false;

export function useMediaQuery(query: string): boolean {
  const { subscribe, getSnapshot } = entryFor(query);
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export const useIsMobile = () => useMediaQuery("(max-width: 767px)");
export const usePrefersReducedMotion = () => useMediaQuery("(prefers-reduced-motion: reduce)");
/** True on devices with a precise pointer (mouse/trackpad) - false on touch,
 * where there's no persistent cursor to replace. */
export const useHasFinePointer = () => useMediaQuery("(pointer: fine)");
