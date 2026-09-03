export type Section = "education" | "certifications" | "early" | "projects" | "skills" | "contact";

/** The one list to extend: each entry becomes a floor of the descent, top to
 * bottom. Add a section here (plus its content in sectionContent.tsx) and
 * every placement, nav link, dot and depth marker follows. */
export const SECTION_ORDER: Section[] = ["education", "certifications", "early", "projects", "skills", "contact"];

export const SECTION_LABELS: Record<Section, string> = {
  education: "Education",
  certifications: "Certifications",
  early: "Early Dev",
  projects: "Projects",
  skills: "Skills",
  contact: "Contact",
};

/** Vertical distance between floors, in CSS px of world space. Phones get a
 * taller pitch: at z=0 there's no perspective shrink, so with the desktop
 * spacing the next floor's label would sit right on the bottom edge. */
export const FLOOR_PITCH = 640;
const FLOOR_PITCH_MOBILE = 800;
export const pitch = (mobile = false) => (mobile ? FLOOR_PITCH_MOBILE : FLOOR_PITCH);
/** Where a floor's monolith stands (left of center) and its panel sits (right). */
export const MONO_X = -320;
export const PANEL_X = 220;
/** Depth of the whole column relative to the camera at rest. */
export const FOCUS_Z = -300;

/** Depth -1 is the overview above the column; floor i is depth i. */
export const DEPTH_MIN = -1;
export const DEPTH_MAX = SECTION_ORDER.length - 1;

/** Camera pose for the overview: pulled up and back, tilted to look down the
 * shaft so the column of floors recedes below. Eases out on the first descent. */
const OVERVIEW = { y: -200, z: -560, rx: -18 };
/** Phones: the nav takes two rows up top, so the column hangs lower. */
const OVERVIEW_MOBILE = { y: 40, z: -560, rx: -18 };
/** How far the camera dollies back mid-glide between two floors. */
const DOLLY = 140;

/**
 * Placements come in two compositions. Desktop: monolith left of center, its
 * panel to the right, both pushed back to FOCUS_Z. Phone: everything on the
 * center line at z=0 (so the panel can be sized in viewport units 1:1) -
 * a smaller monolith up top with its panel below it.
 */
export function monoPlace(i: number, mobile = false): string {
  return mobile
    ? `translate3d(0px, ${i * pitch(true) - 150}px, 0px) scale(0.6)`
    : `translate3d(${MONO_X}px, ${i * FLOOR_PITCH + 70}px, ${FOCUS_Z}px)`;
}

export function panelPlace(i: number, mobile = false): string {
  return mobile
    ? `translate3d(0px, ${i * pitch(true) + 175}px, 0px)`
    : `translate3d(${PANEL_X}px, ${i * FLOOR_PITCH}px, ${FOCUS_Z}px) rotateY(-6deg)`;
}

/** The landing ring under each monolith, on the floor line. */
export function ringPlace(i: number, mobile = false): string {
  return mobile
    ? `translate3d(0px, ${i * pitch(true) - 70}px, 0px) scale(0.5)`
    : `translate3d(${MONO_X}px, ${i * FLOOR_PITCH + 200}px, ${FOCUS_Z}px)`;
}

/** The big faint floor number behind each panel. */
export function markPlace(i: number, mobile = false): string {
  return mobile
    ? `translate3d(0px, ${i * pitch(true) + 40}px, -260px)`
    : `translate3d(${PANEL_X + 60}px, ${i * FLOOR_PITCH - 60}px, ${FOCUS_Z - 260}px)`;
}

/** How far out the shaft walls stand. */
export function wallX(mobile = false): number {
  return mobile ? 300 : 820;
}

export function clampDepth(d: number): number {
  return Math.min(DEPTH_MAX, Math.max(DEPTH_MIN, d));
}

/** Continuous camera pose for any depth - the same function drives the glide
 * and the resting pose, so there is never a seam between the two. */
export function cameraFor(depth: number, mobile = false): { x: number; y: number; z: number; rx: number } {
  const d = clampDepth(depth);
  if (d <= 0) {
    // overview -> first floor: ease the tilt and pull-back out
    const o = mobile ? OVERVIEW_MOBILE : OVERVIEW;
    const t = d + 1;
    const e = t * t * (3 - 2 * t);
    return { x: 0, y: o.y * (1 - e), z: o.z * (1 - e), rx: o.rx * (1 - e) };
  }
  const f = d - Math.floor(d);
  return { x: 0, y: -d * pitch(mobile), z: -DOLLY * Math.sin(Math.PI * f), rx: 0 };
}

export function worldTransform(depth: number, mobile = false): string {
  const c = cameraFor(depth, mobile);
  return `translate3d(${c.x.toFixed(1)}px, ${c.y.toFixed(1)}px, ${c.z.toFixed(1)}px) rotateX(${c.rx.toFixed(2)}deg)`;
}

/** Depth readout for the gauge and floor markers: 40 m per floor, 0 at the overview. */
export function depthMeters(depth: number): number {
  return Math.round(Math.max(0, clampDepth(depth) + 1) * 40);
}

export function formatDepth(depth: number): string {
  return `−${String(depthMeters(depth)).padStart(3, "0")} m`;
}
