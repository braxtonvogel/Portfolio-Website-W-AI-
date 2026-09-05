# Weak-device optimization pass — full report

**Date:** 2026-09-04
**Goal:** cut CPU/GPU/memory work so the site runs on weaker phones, with a hard constraint of **zero change to anything a visitor sees or experiences** — no layout, color, animation, timing, or feature is allowed to differ, ever, on any device or theme.

Keep this file. If anything about the site ever looks or behaves differently than before 2026-09-04, this is the first place to check — every change below names its own revert.

## How this was produced

This wasn't a single pass — it was audited and then adversarially attacked before a single line was touched:

1. **Discover** — four Opus agents, each assigned one subsystem (WebGL/Three.js backdrop; the dive world's CSS/animation/per-frame layer; React render patterns across every page; the data/build/bundle layer), read the actual current code and proposed **36 candidate optimizations**, each required to name the exact mechanical change, the performance benefit, and a specific mechanism (not a guess) for why it's byte-identical to what's there today.
2. **Verify** — every one of the 36 candidates was independently judged by **three separate agents** (two Opus, one Fable), each explicitly instructed to try to *break* the candidate — construct any scenario (theme, viewport, reduced-motion, mid-animation, a plausible future addition) where it could change something visible — and default to rejecting on any unresolved doubt.
3. Only candidates **all three verifiers approved unanimously** were implemented. A single dissenting vote killed the candidate. This rejected 21 of 36, including two that would have caused real, confirmed regressions (see "Rejected" below).
4. Every approved change was then implemented **exactly as specified** by the vetted proposal, followed by `tsc --noEmit`, `eslint`, a full `next build`, and live browser testing (desktop + mobile, the dive world's full descent, the Skills panel's click-through, the FakeAI chat widget, a project page) before this report was written.

**One real regression was caught and fixed during implementation** — see the callout under `lib/useMediaQuery.ts` below. It's the reason the full production build step matters and not just `tsc`/`eslint`.

---

## Applied changes (15 approved → 14 edits, one pair merged)

### 1. `components/dive/backdropRenderer.ts` — stop reallocating the WebGL backbuffer twice on every resize

**What changed:** `fit()` now only calls `renderer.setPixelRatio(dpr)` when the ratio actually changed (`if (renderer.getPixelRatio() !== dpr)`), instead of unconditionally on every call.

**Why it's safe:** `setPixelRatio` always calls `setSize` internally, which reassigns `canvas.width`/`height` and reinitializes the WebGL drawing buffer — even when the value is unchanged, per the HTML spec. The very next line, the existing unconditional `renderer.setSize(w, h, false)`, already recomputes the identical `canvas.width`/`height`/viewport from the same `w`/`h`/`dpr` regardless. Skipping the redundant `setPixelRatio` call removes one full framebuffer reallocation per resize with no change to the end state.

**Why it matters for weak devices:** a phone's URL bar collapsing/expanding during scroll fires this resize repeatedly; each firing previously reallocated the whole color+depth buffer twice instead of once.

**To revert:** restore the two unconditional lines:
```ts
renderer.setPixelRatio(dpr);
renderer.setSize(w, h, false);
```

---

### 2. `components/dive/backdropScene.ts` — city index buffer as Uint16 instead of Uint32

**What changed:** the city mesh's index buffer is now `(em.n <= 65535 ? Uint16Array : Uint32Array).from(em.idx)` instead of always `Uint32Array.from(em.idx)`. The `SceneData` type was widened to `Uint16Array | Uint32Array`.

**Why it's safe:** the scene is verified to be exactly 11,400 vertices (checked across the full aspect-ratio range the layout supports, 0.20–4.00), so every index value is ≤ 11,399 — well inside Uint16's 65,535 ceiling. The exact same integers land in the exact same order; three.js reads the typed array's own constructor to choose `gl.UNSIGNED_SHORT` vs `gl.UNSIGNED_INT`, so nothing else needed to change.

**Why it matters:** halves this buffer's GPU memory (68.4 KB → 34.2 KB) and halves index-fetch bandwidth for the only indexed draw call in the scene.

**To revert:** change the line back to `index: Uint32Array.from(em.idx),` and `index: Uint32Array;` in the type.

---

### 3. `components/dive/World.tsx` — memoize the six floor panels' content on `activeIndex`

*(Two independent discovery agents — one auditing CSS/animation, one auditing React patterns — found this exact same issue separately. Implemented once.)*

**What changed:** added `const panelContent = useMemo(() => SECTION_ORDER.map((section, i) => getSectionContent(section, activeIndex === i)), [activeIndex]);` above the render, and each `<SectionPanel>` now receives `{panelContent[i]}` instead of calling `getSectionContent(section, activeIndex === i)` inline.

**Why it's safe:** `getSectionContent` is a pure function of exactly two inputs (`section`, `renderPdf`), and `renderPdf` here is only ever `activeIndex === i` — so the memo's single dependency is a complete dependency list. React elements are immutable descriptors; reusing the same one across renders produces identical DOM.

**Why it matters:** `World` re-renders at pointer rate during the overview's mouse-tilt, and on every floor/hint change on mobile. Each of those renders was rebuilding ~100 React elements per panel × 6 panels (the Skills panel alone builds ~40 links) for output that hadn't changed.

**To revert:** delete the `panelContent` useMemo and change `{panelContent[i]}` back to `{getSectionContent(section, activeIndex === i)}` inline in the map.

---

### 4. `components/dive/World.tsx` — stable ref and floor-select callbacks

**What changed:** `monoRefCbs`, `panelRefCbs` (both `useMemo(..., [])`) and `selectCbs` (`useMemo(..., [goTo])`) replace the inline arrow functions previously passed as `innerRef`/`onSelect` to each `Monolith`/`SectionPanel`.

**Why it's safe:** the refs end up pointing at the identical DOM nodes — only how many times React re-assigns them changes. The closures capture only a loop index and `goTo` (already stable via `useDescent`'s own `useCallback`).

**Why it matters:** previously, 12 fresh ref callbacks + 6 fresh `onSelect` closures were created on *every* render, which forces React to detach and reattach every ref during commit (old callback called with `null`, new one with the element) — including at pointer rate during the overview tilt. This is strictly safer than before, too: it closes a real (if previously harmless) window where a per-frame style write could land while a ref was momentarily `null` mid-detach.

**To revert:** replace `innerRef={monoRefCbs[i]}` / `innerRef={panelRefCbs[i]}` / `onSelect={selectCbs[i]}` with the original inline arrows, and delete the three `useMemo`s.

---

### 5. `components/dive/World.tsx` — gauge only writes text when the whole-meter value changes

**What changed:** added `lastMetersRef` (starts at `-1`); the gauge's `textContent` write is now gated on `depthMeters(d)` actually changing, instead of running unconditionally every frame.

**Why it's safe:** `formatDepth(d)` is a total function of `depthMeters(d)` alone, so gating on the rounded integer is exactly equivalent to gating on the resulting string — the gauge shows the identical text on every frame it did before.

**Why it matters:** a floor traversal covers 40m in about a second; well over a third of frames at 60fps were previously producing an identical string and still mutating the text node (which invalidates layout/paint for that element) anyway.

**To revert:** delete `lastMetersRef` and change back to the unconditional `if (gaugeRef.current) gaugeRef.current.textContent = formatDepth(d);`.

---

### 6. `components/dive/World.tsx` — flat-array panel cache instead of per-frame object allocation

**What changed:** `lastPanelRef` (an array of `{o, y}` objects) is replaced with two flat arrays, `lastPanelO`/`lastPanelY`.

**Why it's safe:** the skip predicate is arithmetically identical (`Math.abs(lo - o) < 0.001 && Math.abs(ly - y) < 0.05`), just read from two arrays instead of one object.

**Why it matters:** during a glide, 2–3 panels are typically still moving, meaning 2–3 short-lived object allocations per frame — pure GC pressure with no purpose beyond internal bookkeeping. Weak phones feel nursery-GC pauses as dropped frames mid-scroll.

**To revert:** restore `const lastPanelRef = useRef<({ o: number; y: number } | undefined)[]>([]);` and the object-based read/write in `placePanel`.

---

### 7. `components/dive/NightSea.tsx` — `React.memo`

**What changed:** `NightSea` is now wrapped in `memo()` on its default export.

**Why it's safe:** all three props (`moonBlue`, `rings`, `reducedMotion`) are booleans — a shallow compare is exact, with no case where it's structurally equal but referentially different.

**Why it matters:** the welcome screen's typewriter effect calls `setTyped` every 40–70ms for as long as the welcome screen is visible, re-rendering `NightSea`'s entire subtree (sky, stars, three moon layers, sea, canvas, and mid-dive five ripple rings) 15–25 times a second — on the very first screen every visitor lands on.

**To revert:** change `export default memo(NightSea);` back to `export default function NightSea({...`.

---

### 8. `lib/useMediaQuery.ts` — cache the MediaQueryList + subscription per query string

**What changed:** one `MediaQueryList` and one stable `subscribe`/`getSnapshot` pair is now created and cached per distinct query string, shared across every component watching it, instead of a fresh closure (and a fresh `MediaQueryList` inside `getSnapshot`) on every render of every consumer.

**⚠️ A real regression was caught and fixed here during implementation.** My first version called `window.matchMedia` eagerly inside the function that runs on every render (`entryFor`), which broke server-side rendering entirely (`ReferenceError: window is not defined`, confirmed by a failed `next build`). The final version defers the actual `window.matchMedia` call into a separate `getMql` helper that is only ever invoked from *inside* `subscribe`/`getSnapshot` — which are only ever called by React on the client, exactly matching the safety property the original, uncached code had. **This is exactly why the full `next build` (not just `tsc`/`eslint`) was run before anything was called done** — this class of bug is invisible to the type checker.

**Why it's safe (final version):** a cached `MediaQueryList` reports the same `.matches` at any instant as a fresh one for the same query. Listener semantics are unchanged — N subscribers now share one `MediaQueryList` with N listeners instead of N separate ones, but the same number of callbacks fire in the same relative order.

**Why it matters:** the dive world's Skills/Projects/Certifications panels alone mount ~50 components calling these hooks simultaneously; each was independently re-subscribing and re-parsing a `MediaQueryList` on every render.

**To revert:** restore the original three-line hook body (see git history for this file, or the previous version below):
```ts
export function useMediaQuery(query: string): boolean {
  const subscribe = (onChange: () => void) => {
    const mql = window.matchMedia(query);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  };
  const getSnapshot = () => window.matchMedia(query).matches;
  const getServerSnapshot = () => false;
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
```

---

### 9. `app/page.tsx` — stable `onFloorChange` / `onTilt` / `onReady`

**What changed:** `onFloorChange` and `onTilt` are now `useCallback(..., [])`; a new `handleReady = useCallback(() => bootDoneRef.current(), [])` replaces the inline `onReady={() => bootDoneRef.current()}`.

**Why it's safe:** all three bodies close over only React state setters (stable by contract) or a ref read at call time (`bootDoneRef.current`), which always sees the latest value regardless of when the wrapping closure was created — the same property that motivated introducing `bootDoneRef` in the first place.

**Why it matters:** `World`'s own `handleFloorChange` callback depends on `[onFloorChange, onTilt]`; a fresh identity on every `Home` render was cascading into `useDescent`'s `engine.configure()` effect and World's ready-sync effect re-running on every render too — including every mouse-move tilt frame.

**To revert:** change the three `useCallback`s back to plain function declarations / an inline arrow at the `onReady` prop.

---

### 10. `components/FakeAI.tsx` — three related changes to the chat widget

**10a. `findTerm` uses a cached `Map` instead of a linear scan.** Built lazily on first use; iterates `ALL_TERMS` in its existing longest-first order and never overwrites an existing key, so it returns the exact same first match `Array.prototype.find` did — including the duplicate-phrase case that motivated the longest-first sort. *Revert: restore `ALL_TERMS.find((t) => t.phrase.toLowerCase() === lower)`.*

**10b. `findMatches` walks a pre-flattened `kbEntries` array instead of nested `Object.values`/`Object.entries` loops on every call.** `knowledgeBase` is a static object literal, so both approaches visit the identical `(key, answer)` pairs in the identical order; a plain `break` out of the single flattened loop is semantically identical to the original `break outer` out of the nested loops. *Revert: restore the nested `outer: for (const group of Object.values(knowledgeBase))` loop.*

**10c. The fuzzy edit-distance pass is guarded by a length-difference bound before calling `editDistance`.** This is a mathematical guarantee, not a heuristic: every edit-distance operation changes a string's length by at most 1, so `distance(a, b) >= |a.length - b.length|` always holds — any pair failing that bound was already going to fail the comparison. The guard only skips calls whose result is already determined. *Revert: remove the `Math.abs(w.length - key.length) <= maxEdits` clause.*

**Verified live** (see "Verification performed" below): sent a real chat message mentioning SammyOS, "pyhton" (typo), and "rust" — got back correctly-linked mentions of Python, Rust, Tauri, Redis, and multi-LLM, all pointing at the right project pages.

---

### 11. `app/globals.css` — five dead animation blocks + one duplicate rule removed

**What changed:** deleted `@keyframes skillFade`/`.animate-skillFade`, `@keyframes skillScatter`/`.animate-skillScatter`, `@keyframes shake`/`.shake`, `@keyframes orb1`/`orb2`/`orb3` and their three `.animate-orb-*` classes, and one exact duplicate `html { scroll-behavior: smooth; }` block.

**Why it's safe:** verified dead three separate ways — a repo-wide grep for every one of those class/keyframe names outside `globals.css` itself returns zero hits in any `.tsx`/`.module.css`/template literal; the same names appear zero times in the actual built static export's HTML/CSS. Nothing dynamically constructs these class names anywhere in the codebase.

**Why it matters:** ~1.6 KB of dead CSS the browser no longer parses/registers on every page load. One of the deleted rules (`.animate-skillScatter`) carried both `will-change: transform, opacity` and an animated `filter: blur()` — exactly the kind of rule you'd never want live on the target hardware, and it's now gone rather than just unused.

**To revert:** these blocks are fully quoted in this report's git diff (`git show <this-commit> -- app/globals.css`) if they ever need to come back.

---

### 12. `lib/siteNav.ts` — cache `siteNavItems()` per argument

**What changed:** results are now cached in a `Map` keyed by `activePage ?? ""` (which only ever takes 4 distinct values), instead of rebuilding a 6-item array of fresh objects on every call.

**Why it's safe:** the map body is unchanged and depends only on module-level constants nothing mutates, so the result is deep-equal on every call for a given argument — caching just stops re-deriving the same answer.

**Why it matters:** seven client pages (all six project pages + early-development) call this inline in JSX on every render, each allocating a new array + 6 objects + 6 template-literal strings for output that's always identical, and handing `Navbar` a fresh prop reference every time.

**To revert:** remove the `navCache` Map and go back to the plain `return SECTION_ORDER.map(...)`.

---

## Rejected (21 of 36) — considered, and correctly turned down

The adversarial verification step earned its keep here. Briefly, by subsystem:

- **WebGL (4 rejected):** a noise-texture format change (RG8 vs RGBA8), a caustic-shader branch skip, a background-quad depth-reject, and a normal-attribute Int16 packing — all had sound-looking mechanisms, but each was rejected either on a subtle correctness gap the verifiers found or (for the depth-reject one) on stale/insufficiently-certain reasoning about render-order interactions with the transparent light/mote passes.
- **CSS/animation world (5 rejected):** `React.memo` on `Monolith`/`SectionPanel` (broke on the `--fog` CSS-custom-property write timing), hoisting the shaft walls/rings/depth-markers into a `useMemo` (one verifier found a real edge case), a `classList.toggle` guard on the overview dot (the specific proposed code had a null-ref hazard), precomputing NightSea's glitter geometry (one dissent), and — notably — **removing `.ring`'s `will-change: transform`**, which was rejected because the discoverer's premise was factually wrong (`--ringPlace` is *not* written only once, contrary to the proposal's core claim). This is exactly the kind of fragile area flagged as high-risk in the brief, and the process worked as intended.
- **React patterns (8 rejected):** per-keystroke linkify re-computation (real payoff was smaller than claimed), an `editDistance` buffer reuse (correct but negligible upside, rejected as not worth the risk for near-zero gain), the certification page's scroll-driven style writes and its inline ref callbacks, a project page's scroll-progress re-render, the dive nav's item-array memoization (mechanically flawed as proposed), GlyphRain's per-frame string allocations (a real break was found: no `contextlost` handling), and `FadeInSection`'s `transition-all` (the proposed fix would have caused a visible regression on 58 elements).
- **Build/data layer (4 rejected):** a duplicate, non-cache-safe version of the `useMediaQuery` fix (superseded by the approved one), splitting certification segment data out of the root bundle, a lossless PNG re-encode bundled with a lossy JPEG conversion that would have visibly changed the certificate image, and lazy-loading framer-motion's `LazyMotion`/`domAnimation` build.

Full reasoning for every rejection (including each verifier's specific attack and verdict) is preserved in this session's workflow transcript, not reproduced here to keep this file focused on what actually changed.

---

## Verification performed

- `npx tsc --noEmit` — clean, no errors, after every batch of edits.
- `npx eslint app components lib` — clean; the one warning present (`app/page.tsx`, a `timers.current` ref-in-cleanup warning) is pre-existing and unrelated to this pass.
- `npm run build` (full production build, Turbopack) — **caught and led to fixing** the `useMediaQuery` SSR regression described above; passed cleanly on the second attempt, all 13 routes prerendering successfully.
- Live browser verification, desktop and mobile:
  - Welcome screen (typewriter, moon, night sea) — unchanged.
  - Full dive-in entrance choreography (shaft walls, monolith spawn/distribute) — unchanged.
  - Scrolled through multiple floors — depth gauge updates correctly at each floor (−040 M, −200 M, etc.), nav highlighting correct.
  - Skills panel — clicked a skill pill (Python), confirmed correct navigation to its project page.
  - FakeAI chat widget — sent a real message, confirmed correct fuzzy-matched + linkified replies (SammyOS, Rust, Tauri, Redis, multi-LLM, and a typo'd "pyhton" all resolved correctly).
  - A project page's nav (exercises the `siteNavItems` cache) — correct active state.
  - Zero console errors observed at any step.

## What to do if something looks wrong later

1. Check this file first — find the numbered section for the area that changed.
2. Each entry's "To revert" line tells you exactly what to restore.
3. Or, at the git level: `git log --oneline` to find this pass's commit, then `git revert <hash>` (or `git show <hash> -- <file>` to see just that file's prior version and hand-restore it).
