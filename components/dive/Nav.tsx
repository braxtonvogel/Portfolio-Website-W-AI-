"use client";

import { SECTION_LABELS, SECTION_ORDER, type Section } from "./sections";

/** Only rendered once the dive-in has landed in the space - there's nothing to
 * navigate to from the welcome page, so it stays hidden until then. Links come
 * straight from SECTION_ORDER so a new floor shows up here automatically. */
export default function Nav({
  active,
  onHome,
  onGo,
}: {
  active: Section | null;
  onHome: () => void;
  onGo: (section: Section) => void;
}) {
  const linkStyle = (isActive: boolean) =>
    `px-2 py-1 border-b transition-colors ${
      isActive ? "text-white border-cyan-400" : "text-zinc-300 border-transparent hover:text-white"
    }`;

  return (
    <div className="fixed top-0 left-0 w-full z-30 flex justify-center bg-black/60 backdrop-blur-md border-b border-white/10 py-3 gap-2 md:gap-6 text-xs md:text-sm flex-wrap">
      <button onClick={onHome} className={linkStyle(false)}>
        Home
      </button>
      {SECTION_ORDER.map((section) => (
        <button key={section} onClick={() => onGo(section)} className={linkStyle(active === section)}>
          {SECTION_LABELS[section]}
        </button>
      ))}
    </div>
  );
}
