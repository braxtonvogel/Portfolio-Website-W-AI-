import { projects } from "./projects";

export function searchSkills(query: string) {
  const q = query.toLowerCase();

  const matches = projects.filter((p) => {
    const techText = Array.isArray(p.tech)
      ? p.tech.join(" ")
      : p.tech;

    const text =
      p.title.toLowerCase() +
      " " +
      techText.toLowerCase() +
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
          slug: project.href, // safe + consistent
        },
      },
    ];
  }

  return [];
}