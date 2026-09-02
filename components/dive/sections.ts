export type Section = "education" | "certifications" | "early" | "projects" | "skills" | "contact";

export const SECTION_ORDER: Section[] = ["education", "certifications", "early", "projects", "skills", "contact"];

/** Degrees each monolith sits at around the arc, left to right. */
export const ANGLES: Record<Section, number> = {
  education: 60,
  certifications: 36,
  early: 12,
  projects: -12,
  skills: -36,
  contact: -60,
};

/** Camera geometry: arc radius, how close a focused section gets pulled, and its
 * lateral shift so the focused monolith lands left-of-center (leaving room for its
 * content panel on the right). */
export const CAMERA = { R: 900, D: 300, SHIFT: -320 };

/** Per-monolith placement: transform, and opacity ("fog," farther = dimmer). */
export const MONO_PLACE: Record<Section, { place: string; fog: number }> = {
  education: { place: "translate3d(-779px, 70px, -450px) rotateY(60deg)", fog: 1 },
  certifications: { place: "translate3d(-529px, 70px, -728px) rotateY(36deg)", fog: 0.9 },
  early: { place: "translate3d(-187px, 70px, -880px) rotateY(12deg)", fog: 0.8 },
  projects: { place: "translate3d(187px, 70px, -880px) rotateY(-12deg)", fog: 0.8 },
  skills: { place: "translate3d(529px, 70px, -728px) rotateY(-36deg)", fog: 0.9 },
  contact: { place: "translate3d(779px, 70px, -450px) rotateY(-60deg)", fog: 1 },
};

/** Placement for each section's content panel, positioned just past its monolith. */
export const SEC_PLACE: Record<Section, string> = {
  education: "translate3d(-609px, 0px, -744px) rotateY(60deg)",
  certifications: "translate3d(-254px, 0px, -928px) rotateY(36deg)",
  early: "translate3d(146px, 0px, -951px) rotateY(12deg)",
  projects: "translate3d(520px, 0px, -809px) rotateY(-12deg)",
  skills: "translate3d(804px, 0px, -528px) rotateY(-36deg)",
  contact: "translate3d(949px, 0px, -156px) rotateY(-60deg)",
};

export function worldTransform(active: Section | null): string {
  if (!active) return "translate3d(0px, 0px, 0px) rotateY(0deg)";
  return `translate3d(${CAMERA.SHIFT}px, 0px, ${CAMERA.R - CAMERA.D}px) rotateY(${-ANGLES[active]}deg)`;
}
