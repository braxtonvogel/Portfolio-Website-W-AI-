"use client";

import Navbar, { type NavItem } from "@/components/Navbar";
import { SECTION_LABELS, SECTION_ORDER, type Section } from "./sections";

/** Only rendered once the dive-in has landed in the space - there's nothing to
 * navigate to from the welcome page, so it stays hidden until then. Links come
 * straight from SECTION_ORDER so a new floor shows up here automatically.
 * The bar itself is the shared site Navbar; these entries drive the camera
 * instead of routing. */
export default function Nav({
  active,
  onHome,
  onGo,
}: {
  active: Section | null;
  onHome: () => void;
  onGo: (section: Section) => void;
}) {
  const items: NavItem[] = SECTION_ORDER.map((section) => ({
    label: SECTION_LABELS[section],
    active: active === section,
    onClick: () => onGo(section),
  }));
  return (
    <Navbar
      variant="dark"
      brand={{ label: "Braxton Vogel", onClick: onHome }}
      pinned={{ label: "Home", onClick: onHome }}
      items={items}
    />
  );
}
