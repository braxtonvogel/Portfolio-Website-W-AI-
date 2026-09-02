"use client";

import type { Section } from "./sections";

const LINKS: { label: string; section: Section }[] = [
  { label: "Education", section: "education" },
  { label: "Certifications", section: "certifications" },
  { label: "Early Dev", section: "early" },
  { label: "Projects", section: "projects" },
  { label: "Skills", section: "skills" },
  { label: "Contact", section: "contact" },
];

/** Only rendered once the dive-in has landed in the space - there's nothing to
 * navigate to from the welcome page, so it stays hidden until then. */
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
      {LINKS.map(({ label, section }) => (
        <button key={section} onClick={() => onGo(section)} className={linkStyle(active === section)}>
          {label}
        </button>
      ))}
    </div>
  );
}
