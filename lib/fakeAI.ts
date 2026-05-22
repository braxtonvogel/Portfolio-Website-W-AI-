import { projects } from "./projects";

export function searchSkills(query: string) {
  const q = query.toLowerCase();

  const matches = projects.filter((p) => {
    const text =
      p.title.toLowerCase() +
      " " +
      p.tech +
      " " +
      p.skills.join(" ").toLowerCase();

    return text.includes(q);
  });

  if (matches.length === 0) return [];

  const project = matches[0];

  return [
    {
      project: {
        title: project.title,
        slug: project.href,
      },
    },
  ];
}