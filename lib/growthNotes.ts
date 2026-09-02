export interface GrowthNote {
  slug: string;
  title: string;
  date: string; // e.g. "Sept 2026"
  topic: string; // short topic tag, e.g. "Software Architecture"
  person?: string; // who the note involves, e.g. a mentor's name
  description: string;
  pdf: string;
}

export const growthNotes: GrowthNote[] = [
  {
    slug: "software-architecture-notes",
    title: "Software Architecture Notes",
    date: "Sept 2026",
    topic: "Software Architecture",
    person: "Jeffrey Palermo",
    description:
      "Starting an unofficial mentorship with Jeffrey Palermo, who's been helping me grow as a developer. These are my notes from our first round of discussions on software architecture: architectural styles and patterns, how to choose an architecture, embedded/edge computing, and why markups matter before starting a project.",
    pdf: "/growth-notes/software-architecture-notes.pdf",
  },
];
