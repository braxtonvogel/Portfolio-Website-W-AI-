"use client";

import Navbar, { type NavItem } from "@/components/Navbar";
import { SECTION_LABELS, SECTION_ORDER, type Section } from "./sections";

/** Shown from first paint so visitors can skip the intro and jump to a floor.
 * On the welcome screen, onGo runs the dive and lands on that section; once
 * in the space it drives the camera. Links come straight from SECTION_ORDER
 * so a new floor shows up here automatically. The bar itself is the shared
 * site Navbar. */
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
