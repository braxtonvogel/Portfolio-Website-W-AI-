"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import styles from "./dive.module.css";
import {
  DEPTH_MAX,
  DEPTH_MIN,
  SECTION_LABELS,
  SECTION_ORDER,
  depthMeters,
  formatDepth,
  markPlace,
  monoPlace,
  panelPlace,
  ringPlace,
  wallX,
  worldTransform,
  type Section,
} from "./sections";
import { getSectionContent } from "./sectionContent";
import { useDescent } from "./useDescent";
import Backdrop, { type BackdropHandle } from "./Backdrop";

const CENTERED_SECTIONS: Section[] = ["education", "certifications"];

export type WorldHandle = {
  /** Glide the camera to a floor (index into SECTION_ORDER). */
  goTo(floor: number): void;
};

/**
 * The descent: every section is a floor of a vertical shaft under the sunken
 * city. Scrolling sinks the camera down the column; each floor's monolith
 * stands left of center with its content panel to the right.
 *
 * Nothing per-frame goes through React. `useDescent` owns the depth value and
 * calls `onFrame` every animation frame, which writes transform/opacity
 * straight onto refs - the world's camera transform, each monolith's fog,
 * each panel's fade/lift, the depth gauge, and the WebGL backdrop's descent.
 */
const World = forwardRef<
  WorldHandle,
  {
    spaceClass: string;
    /** The floor currently in focus, or null between floors / at the overview. */
    floor: Section | null;
    hint: boolean;
    tilt: string;
    reducedMotion: boolean;
    /** Phone composition: everything on the center line, panel under its monolith. */
    mobile: boolean;
    /** Holds the entrance choreography until true - lets the boot loading
     * screen finish first, rather than racing it. */
    start: boolean;
    onFloorChange: (section: Section | null) => void;
    onTilt: (dx: number, dy: number) => void;
    onReady?: () => void;
  }
>(function World({ spaceClass, floor, hint, tilt, reducedMotion, mobile, start, onFloorChange, onTilt, onReady }, ref) {
  const containerRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const monoRefs = useRef<(HTMLDivElement | null)[]>([]);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const gaugeRef = useRef<HTMLSpanElement>(null);
  const topDotRef = useRef<HTMLButtonElement>(null);
  const backdropRef = useRef<BackdropHandle>(null);
  const depthRef = useRef(DEPTH_MIN);

  // Drives the entrance choreography entirely from React state instead of
  // self-scheduled CSS `animation-delay`. On integrated graphics, `@keyframes`
  // animations several levels deep inside nested `transform-style:
  // preserve-3d` elements that were only ever scheduled from the moment the
  // element was first created could fail to ever start (confirmed via the Web
  // Animations API reporting them permanently stuck at currentTime 0 well
  // after they should have finished) - every monolith stayed solid black.
  // Toggling a class via a real, later setState call - the same mechanism
  // `:hover`/`.active` already use reliably elsewhere in this component -
  // forces an actual style recalculation at a moment the browser is already
  // processing, which is a far more reliable trigger than a self-scheduled
  // timeline.
  //
  // Three beats, in order: the grid floor grows out from the near edge to the
  // horizon and the shaft walls light up (`assembled`); all monoliths spawn in
  // stacked on top of each other at the center (`spawned`); they then burst
  // down the shaft to their floors (`distributed`).
  const [assembled, setAssembled] = useState(reducedMotion);
  const [spawned, setSpawned] = useState(reducedMotion);
  const [distributed, setDistributed] = useState(reducedMotion);

  useEffect(() => {
    // the initial useState value above already covers the reducedMotion case
    // (everything starts fully-on immediately) - nothing to schedule. And
    // don't start building until told to (see the `start` prop) - the world
    // is already mounted at this point, just sitting invisible, so the boot
    // loading screen gets to finish its own beat uninterrupted first.
    if (reducedMotion || !start) return;

    // the shaft walls take ~1.5s to light up (see .shaftWall in
    // dive.module.css) - let that beat land before the monoliths spawn in
    const assembleTimer = setTimeout(() => setAssembled(true), 20);
    const spawnTimer = setTimeout(() => setSpawned(true), 1550);
    const distributeTimer = setTimeout(() => setDistributed(true), 2150);
    // safety net: on a slow/throttled device the timers above can all land
    // late, but they should never land NEVER - this is a hard guarantee that
    // the scene reaches its fully-lit, fully-distributed state within 4s no
    // matter what, so a bad frame or a delayed timer can't leave the world
    // permanently stuck looking unrendered.
    const forceTimer = setTimeout(() => {
      setAssembled(true);
      setSpawned(true);
      setDistributed(true);
    }, 4000);

    return () => {
      clearTimeout(assembleTimer);
      clearTimeout(spawnTimer);
      clearTimeout(distributeTimer);
      clearTimeout(forceTimer);
    };
  }, [reducedMotion, start]);

  // tells the boot loading screen (in page.tsx) it's safe to leave - it waits
  // on this instead of a fixed guess, so a slow device gets a longer loading
  // screen instead of dismissing early onto a still-assembling scene, and a
  // fast one isn't held up waiting on a duration sized for the slow case.
  // Fired once, when the scene finishes distributing - NOT keyed on the
  // `onReady` prop itself: the page passes a fresh inline function every
  // render, and re-running the boot-done callback on every re-render kept
  // re-showing the "scroll to descend" hint after a floor had been picked.
  const readyRef = useRef(onReady);
  useEffect(() => {
    readyRef.current = onReady;
  }, [onReady]);
  useEffect(() => {
    if (distributed) readyRef.current?.();
  }, [distributed]);

  const onFrame = useCallback((d: number) => {
    depthRef.current = d;
    if (worldRef.current) worldRef.current.style.transform = worldTransform(d, mobile);
    // a panel rises into place as its floor approaches and falls away past it
    const placePanel = (panel: HTMLDivElement | null, at: number) => {
      if (!panel) return;
      const o = Math.max(0, 1 - Math.abs(d - at) * 1.6);
      panel.style.opacity = o.toFixed(3);
      panel.style.transform = `translateY(${((d - at) * -60).toFixed(1)}px)`;
      panel.style.pointerEvents = o > 0.6 ? "auto" : "none";
    };
    for (let i = 0; i < SECTION_ORDER.length; i++) {
      const dist = Math.abs(d - i);
      // farther floors sink into the fog; the column is still readable from
      // the surface
      const mono = monoRefs.current[i];
      if (mono) mono.style.setProperty("--fog", Math.max(0.12, 1 - dist * 0.22).toFixed(3));
      placePanel(panelRefs.current[i], i);
    }
    backdropRef.current?.setDescent((d - DEPTH_MIN) / (DEPTH_MAX - DEPTH_MIN));
    if (gaugeRef.current) gaugeRef.current.textContent = formatDepth(d);
    // the square above the floor dots lights up while the camera is up at
    // the overview (no floor reports "active" there, so it's depth-driven)
    topDotRef.current?.classList.toggle(styles.dotActive, d < DEPTH_MIN + 0.4);
  }, [mobile]);

  const handleFloorChange = useCallback(
    (f: number | null) => {
      // the mouse-follow tilt only runs at the overview - reset it as the
      // camera settles on a floor so the scene holds dead still for reading
      if (f !== null) onTilt(0, 0);
      onFloorChange(f === null ? null : SECTION_ORDER[f]);
    },
    [onFloorChange, onTilt]
  );

  const { goTo } = useDescent({
    containerRef,
    enabled: distributed,
    min: DEPTH_MIN,
    max: DEPTH_MAX,
    reducedMotion,
    onFrame,
    onFloorChange: handleFloorChange,
  });

  useImperativeHandle(ref, () => ({ goTo }), [goTo]);

  const handleMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      // the mouse-follow tilt is an overview-only flourish: once the camera is
      // on a floor it holds still - otherwise the whole scene shifts under the
      // cursor while reading/hovering panel content, fighting link :hover
      // states and reading as a flicker
      if (reducedMotion || depthRef.current > -0.5) return;
      const r = e.currentTarget.getBoundingClientRect();
      if (!r.width || !r.height) return;
      onTilt((e.clientX - r.left) / r.width - 0.5, (e.clientY - r.top) / r.height - 0.5);
    },
    [onTilt, reducedMotion]
  );

  const worldTransition = reducedMotion ? { transition: "none" } : undefined;
  const activeIndex = floor === null ? -1 : SECTION_ORDER.indexOf(floor);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMove}
      className={`${assembled ? styles.assembled : ""} ${spaceClass} absolute inset-0`}
      style={{ transformOrigin: "50% 50%", touchAction: "none" }}
    >
      <div className={styles.stars} />
      <div className={styles.horizon} />
      <Backdrop ref={backdropRef} start={start} dimmed={floor !== null} reducedMotion={reducedMotion} />
      <div className={styles.stage}>
        <div className={styles.tilt} style={{ transform: tilt, ...worldTransition }}>
          <div className={styles.rig} style={worldTransition}>
            <div ref={worldRef} className={styles.world} style={{ transform: worldTransform(DEPTH_MIN, mobile) }}>
              <div className={styles.shaftWall} style={{ transform: `translate3d(${-wallX(mobile)}px, 0px, 400px) rotateY(90deg)` }} />
              <div className={styles.shaftWall} style={{ transform: `translate3d(${wallX(mobile)}px, 0px, 400px) rotateY(90deg)` }} />

              {SECTION_ORDER.map((section, i) => (
                <div key={`ring-${section}`} className={styles.ring} style={{ "--ringPlace": ringPlace(i, mobile) } as React.CSSProperties} />
              ))}

              {SECTION_ORDER.map((section, i) => (
                <div key={`mark-${section}`} className={styles.depthMark} style={{ transform: markPlace(i, mobile) }}>
                  <span className={styles.markNum}>{String(i + 1).padStart(2, "0")}</span>
                  <span className={styles.markLbl}>
                    {SECTION_LABELS[section]} &middot; &minus;{depthMeters(i)} m
                  </span>
                </div>
              ))}

              {SECTION_ORDER.map((section, i) => (
                <Monolith
                  key={section}
                  section={section}
                  index={i}
                  isActive={activeIndex === i}
                  spawned={spawned}
                  distributed={distributed}
                  reducedMotion={reducedMotion}
                  mobile={mobile}
                  innerRef={(el) => {
                    monoRefs.current[i] = el;
                  }}
                  onSelect={() => goTo(i)}
                />
              ))}

              {SECTION_ORDER.map((section, i) => (
                <SectionPanel
                  key={`panel-${section}`}
                  index={i}
                  mobile={mobile}
                  centered={CENTERED_SECTIONS.includes(section) && !mobile}
                  innerRef={(el) => {
                    panelRefs.current[i] = el;
                  }}
                >
                  {getSectionContent(section, activeIndex === i)}
                </SectionPanel>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.floorDots}>
        <button
          ref={topDotRef}
          type="button"
          title="Overview"
          aria-label="Back up to the overview"
          className={`${styles.dot} ${styles.dotTop}`}
          onClick={() => goTo(DEPTH_MIN)}
        />
        {SECTION_ORDER.map((section, i) => (
          <button
            key={section}
            type="button"
            title={SECTION_LABELS[section]}
            aria-label={`Go to ${SECTION_LABELS[section]}`}
            className={`${styles.dot} ${activeIndex === i ? styles.dotActive : ""}`}
            onClick={() => goTo(i)}
          />
        ))}
      </div>
      <div className={styles.gauge}>
        depth <span ref={gaugeRef}>{formatDepth(DEPTH_MIN)}</span>
      </div>
      <div className={`${styles.hint} ${hint ? styles.show : ""}`}>Scroll to descend &mdash; or pick a floor above</div>
    </div>
  );
});

export default World;

function Monolith({
  section,
  index,
  isActive,
  spawned,
  distributed,
  reducedMotion,
  mobile,
  innerRef,
  onSelect,
}: {
  section: Section;
  index: number;
  isActive: boolean;
  spawned: boolean;
  distributed: boolean;
  reducedMotion: boolean;
  mobile: boolean;
  innerRef: (el: HTMLDivElement | null) => void;
  onSelect: () => void;
}) {
  return (
    <div
      ref={innerRef}
      className={`${styles.mono} ${isActive ? styles.active : ""} ${spawned ? styles.revealed : ""} ${
        distributed ? styles.distributed : ""
      }`}
      onClick={onSelect}
      style={{ "--fog": 1, "--place": monoPlace(index, mobile) } as React.CSSProperties}
    >
      <div className={styles.slab} />
      {/* nothing would ever fade this dim overlay away for reduced motion (it
          starts revealed already), so skip rendering it entirely */}
      {!reducedMotion && <div className={styles.slabDim} />}
      <div className={styles.lbl}>{SECTION_LABELS[section]}</div>
    </div>
  );
}

function SectionPanel({
  index,
  mobile,
  centered,
  innerRef,
  children,
}: {
  index: number;
  mobile: boolean;
  centered: boolean;
  innerRef: (el: HTMLDivElement | null) => void;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.secwrap} style={{ transform: panelPlace(index, mobile) }}>
      <div ref={innerRef} data-scrollpanel="" className={`${styles.sec} ${centered ? styles.centered : ""}`}>
        {children}
      </div>
    </div>
  );
}
