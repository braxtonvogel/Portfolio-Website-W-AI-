export interface GrowthNote {
  slug: string;
  title: string;
  date: string; // e.g. "Sept 2026"
  topic: string; // short topic tag, e.g. "Software Architecture"
  person?: string; // who the note involves, e.g. a mentor's name
  description: string;
  /** A standalone PDF write-up, previewed inline. Can be combined with `href`. */
  pdf?: string;
  /** Link out to a fuller page elsewhere on the site (e.g. a project page). Can be combined with `pdf`. */
  href?: string;
  linkLabel?: string; // label for the `href` button - defaults to "View more"
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
  {
    slug: "taskflow-azure-field-notes",
    title: "Field Notes: Building TaskFlow, and What \"Enterprise Azure\" Actually Looks Like",
    date: "Sept 2026",
    topic: "Cloud Infrastructure & DevOps",
    person: "Jeffrey Palermo",
    description:
      "Jeffrey set me up with the Azure for Students credit, so I used it to build TaskFlow — a small .NET API in the Onion Architecture pattern he originated — and deploy it for real. The code was the easy part. What actually taught me something was the university tenant's region policy, a Conditional Access wall that blocked Azure DevOps outright, and a quota exhaustion that took the site down mid-debugging. Full writeup and the project itself live on the same page.",
    pdf: "/growth-notes/taskflow-field-notes.pdf",
    href: "/projects/taskflow",
    linkLabel: "View Project & Full Writeup",
  },
];
