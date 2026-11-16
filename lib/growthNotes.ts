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
  /** Text-only stand-in for the PDF preview page when there's no `pdf`. Rendered as plain text. */
  preview?: { title: string; byline?: string; sections: { heading: string; body: string }[] };
}

export const growthNotes: GrowthNote[] = [
  {
    slug: "octopus-azure",
    title: "Octopus + Azure: Shipping a .NET 11 App",
    date: "Nov 2026",
    person: "Jeffrey Palermo",
    topic: "DevOps",
    description:
      "A .NET 11 Razor Pages app, backed by EF Core and Azure SQL, shipped through a real CI/CD path. GitHub Actions builds the container and pushes it to GHCR; Octopus Deploy releases it to Azure Container Apps.",
    href: "/projects/octopus-azure",
    linkLabel: "Read the case study",
    // no pdf key until a real PDF exists
    preview: {
      title: "Octopus + Azure: Shipping a .NET 11 App",
      byline: "Braxton Vogel",
      sections: [
        {
          heading: "GitOps (Fundamentals, at Scale, Enterprise)",
          body: "I learned GitOps principles with Argo CD and Argo Rollouts, including progressive delivery. At scale, the work is managing apps across QA, staging, and production, and knowing which version is where. The enterprise course covers multi-tenant Argo CD and preview environments.",
        },
        {
          heading: "Octopus Fundamentals",
          body: "I learned the Octopus Way and the main building blocks: projects, environments, releases, deployments, runbooks, and variables.",
        },
        {
          heading: "How I applied it",
          body: "I kept build and release as separate steps. GitHub Actions builds the .NET 11 container and pushes it to GHCR; Octopus creates a release from that image and deploys it to Azure Container Apps.",
        },
      ],
    },
  },
  {
    slug: "software-architecture-notes",
    title: "Software Architecture Notes",
    date: "Sept 2026",
    topic: "Software Architecture",
    person: "Jeffrey Palermo",
    description:
      "Starting a mentorship with Jeffrey Palermo, who's been helping me grow as a developer. These are my notes from our first round of discussions on software architecture: architectural styles and patterns, how to choose an architecture, embedded/edge computing, and why markups matter before starting a project.",
    pdf: "/growth-notes/software-architecture-notes.pdf",
  },
  {
    slug: "taskflow-azure-field-notes",
    title: "Field Notes: Building TaskFlow, and What \"Enterprise Azure\" Actually Looks Like",
    date: "Sept 2026",
    topic: "Cloud Infrastructure & DevOps",
    person: "Jeffrey Palermo",
    description:
      "Jeffrey set me up with the Azure for Students credit, so I used it to build TaskFlow, a small .NET API in the Onion Architecture pattern he originated and deploy it for real. The code was the easy part. What actually taught me something was the university tenant's region policy, a Conditional Access wall that blocked Azure DevOps outright, and a quota exhaustion that took the site down mid-debugging. Full writeup and the project itself live on the same page.",
    pdf: "/growth-notes/taskflow-field-notes.pdf",
    href: "/projects/taskflow",
    linkLabel: "View Project & Full Writeup",
  },
];
