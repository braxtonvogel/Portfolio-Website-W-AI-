import { projects } from "./projects";

export function searchSkills(query: string) {
  const q = query.toLowerCase();

  const matches = projects.filter((p) => {
    const text =
      p.title.toLowerCase() +
      " " +
      p.tech.join(" ").toLowerCase() + // ✅ FIX HERE
      " " +
      p.skills.join(" ").toLowerCase();

    return text.includes(q);
  });

  if (matches.length > 0) {
    const project = matches[0];

    return [
      {
        project: {
          title: project.title,
          slug: project.href,
          href: project.href,
        },
      },
    ];
  }

  return [];
}