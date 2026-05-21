import { projects } from "./projects";

export function fakeAIAnswer(query: string) {
  const q = query.toLowerCase();

  const matches = projects.filter((p) => {
    const text =
      p.title.toLowerCase() +
      " " +
      p.tech.join(" ").toLowerCase() +
      " " +
      p.skills.join(" ").toLowerCase();

    return text.includes(q);
  });

  if (matches.length > 0) {
    const project = matches[0];

    return {
      type: "found",
      message: `Yes — Braxton has experience with this from his ${project.title} project.`,
      link: project.href,
    };
  }

  return {
    type: "not_found",
    message:
      "This isn’t strongly represented yet — but you can explore the projects to see related experience.",
  };
}