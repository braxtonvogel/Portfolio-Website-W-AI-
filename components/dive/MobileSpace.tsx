"use client";

import { SECTION_ORDER, type Section } from "./sections";
import { getSectionContent } from "./sectionContent";

export default function MobileSpace({ spaceClass }: { spaceClass: string }) {
  return (
    <div className={`${spaceClass} relative px-6 pt-24 pb-16 space-y-8`}>
      {SECTION_ORDER.map((section) => (
        <section
          key={section}
          id={`section-${section}`}
          className="scroll-mt-24 rounded-2xl border border-cyan-500/30 bg-white/5 p-6 space-y-4 text-white"
        >
          {getSectionContent(section, true)}
        </section>
      ))}
    </div>
  );
}

export function scrollToSection(section: Section) {
  document.getElementById(`section-${section}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
}
