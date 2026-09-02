"use client";

import { useCallback, useEffect, useState } from "react";
import styles from "./dive.module.css";
import { MONO_PLACE, SEC_PLACE, worldTransform, type Section } from "./sections";
import { getSectionContent } from "./sectionContent";

const CENTERED_SECTIONS: Section[] = ["education", "certifications"];
const ALL_SECTIONS = Object.keys(MONO_PLACE) as Section[];

export default function World({
  spaceClass,
  active,
  hint,
  tilt,
  reducedMotion,
  start,
  onSelect,
  onTilt,
  onReady,
}: {
  spaceClass: string;
  active: Section | null;
  hint: boolean;
  tilt: string;
  reducedMotion: boolean;
  /** Holds the entrance choreography until true - lets the boot loading
   * screen finish first, rather than racing it. */
  start: boolean;
  onSelect: (section: Section) => void;
  onTilt: (dx: number, dy: number) => void;
  onReady?: () => void;
}) {
  const handleMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      // once a section is focused the camera holds still - otherwise the mouse-follow
      // tilt shifts the whole 3D scene under the cursor while reading/hovering panel
      // content, which was fighting with link :hover states and reading as a flicker
      if (reducedMotion || active) return;
      const r = e.currentTarget.getBoundingClientRect();
      if (!r.width || !r.height) return;
      onTilt((e.clientX - r.left) / r.width - 0.5, (e.clientY - r.top) / r.height - 0.5);
    },
    [onTilt, reducedMotion, active]
  );

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
  // horizon (`assembled`); all six monoliths spawn in stacked on top of each
  // other at the center (`spawned`); they then burst outward to their actual
  // arc positions (`distributed`).
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

    // the floor's own grow transition now takes 1.5s (see .floor in
    // dive.module.css) - wait for it to actually finish before the
    // monoliths spawn in on top of it
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
  useEffect(() => {
    if (distributed) onReady?.();
  }, [distributed, onReady]);

  const worldTransition = reducedMotion ? { transition: "none" } : undefined;

  return (
    <div
      onMouseMove={handleMove}
      className={`${assembled ? styles.assembled : ""} ${spaceClass} absolute inset-0`}
      style={{ transformOrigin: "50% 50%" }}
    >
      <div className={styles.stars} />
      <div className={styles.horizon} />
      <div className={styles.stage}>
        <div className={styles.tilt} style={{ transform: tilt, ...worldTransition }}>
          <div className={styles.rig} style={worldTransition}>
            <div
              className={`${styles.world} ${active ? styles.focused : ""}`}
              style={{ transform: worldTransform(active), ...worldTransition }}
            >
              <div className={styles.floor} />
              <div className={styles.pad} />

              {ALL_SECTIONS.map((section) => (
                <Monolith
                  key={section}
                  section={section}
                  isActive={active === section}
                  spawned={spawned}
                  distributed={distributed}
                  reducedMotion={reducedMotion}
                  onSelect={onSelect}
                />
              ))}

              {(Object.keys(SEC_PLACE) as Section[]).map((section) => (
                <SectionPanel
                  key={section}
                  section={section}
                  active={active === section}
                  centered={CENTERED_SECTIONS.includes(section)}
                >
                  {getSectionContent(section, active === section)}
                </SectionPanel>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className={`${styles.hint} ${hint ? styles.show : ""}`}>Choose a destination above &mdash; or click a monolith</div>
    </div>
  );
}

function Monolith({
  section,
  isActive,
  spawned,
  distributed,
  reducedMotion,
  onSelect,
}: {
  section: Section;
  isActive: boolean;
  spawned: boolean;
  distributed: boolean;
  reducedMotion: boolean;
  onSelect: (section: Section) => void;
}) {
  const { place, fog } = MONO_PLACE[section];
  const label = section === "early" ? "Early Dev" : section[0].toUpperCase() + section.slice(1);

  return (
    <div
      className={`${styles.mono} ${isActive ? styles.active : ""} ${spawned ? styles.revealed : ""} ${
        distributed ? styles.distributed : ""
      }`}
      onClick={() => onSelect(section)}
      style={{ "--fog": fog, "--place": place } as React.CSSProperties}
    >
      <div className={styles.slab} />
      {/* nothing would ever fade this dim overlay away for reduced motion (it
          starts revealed already), so skip rendering it entirely */}
      {!reducedMotion && <div className={styles.slabDim} />}
      <div className={styles.lbl}>{label}</div>
    </div>
  );
}

function SectionPanel({
  section,
  active,
  centered,
  children,
}: {
  section: Section;
  active: boolean;
  centered: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.secwrap} style={{ transform: SEC_PLACE[section] }}>
      <div className={`${styles.sec} ${active ? styles.active : ""} ${centered ? styles.centered : ""}`}>
        {children}
      </div>
    </div>
  );
}
