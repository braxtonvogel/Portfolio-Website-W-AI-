import type { NavItem } from "@/components/Navbar";
import { SECTION_LABELS, SECTION_ORDER, type Section } from "@/components/dive/sections";

/** The two sections that are real pages of their own; everything else in
 * SECTION_ORDER only exists as a floor inside the dive world, so its link
 * has to deep-link into "/" with a hash the world reads on load (see the
 * hash effect in app/page.tsx) and glide straight to that floor. */
const STANDALONE_HREF: Partial<Record<Section, string>> = {
  certifications: "/certifications",
  early: "/early-development",
};

export type StandalonePage = "certifications" | "early-development" | "projects";

const ACTIVE_SECTION: Record<StandalonePage, Section> = {
  certifications: "certifications",
  "early-development": "early",
  projects: "projects",
};

/** The full site nav for every page outside the dive world - same six
 * sections it has, so nothing is ever missing depending on where you are. */
export function siteNavItems(activePage?: StandalonePage): NavItem[] {
  return SECTION_ORDER.map((section) => ({
    label: SECTION_LABELS[section],
    href: STANDALONE_HREF[section] ?? `/#${section}`,
    active: activePage !== undefined && ACTIVE_SECTION[activePage] === section,
  }));
}

export const SITE_NAV_PINNED: NavItem = { label: "Home", href: "/" };
export const SITE_NAV_BRAND = { label: "Braxton Vogel", href: "/" };
