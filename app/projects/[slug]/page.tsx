import Navbar from "@/components/Navbar";
import Link from "next/link";

const projects: Record<string, any> = {
  "chat-server": {
    title: "Chat Server",
    type: "Personal Project",
    tech: "Python • Networking",
    description: "Real-time multi-user chat system.",
    github: "https://github.com/braxtonvogel",
  },

  "dnd-builder": {
    title: "D&D Builder",
    type: "Group Project",
    tech: "SQL • Database Design",
    description: "Character database system.",
    github: "https://github.com/braxtonvogel",
  },

  "file-manager": {
    title: "File Manager UI",
    type: "Personal Project",
    tech: "React • UI/UX",
    description: "File organization interface.",
    github: "https://github.com/braxtonvogel",
  },
};

export default function ProjectPage({
  params,
}: {
  params: { slug: string };
}) {
  const project = projects[params.slug];

  if (!project) {
    return (
      <main className="p-10">
        <Link href="/">← Home</Link>
        <h1>Project not found</h1>
      </main>
    );
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen px-6 py-16 bg-zinc-50 dark:bg-black text-black dark:text-white">

        <div className="flex gap-4 mb-6">
          <Link href="/" className="underline">Home</Link>
          <Link href="/projects" className="underline">Projects</Link>
        </div>

        <h1 className="text-4xl font-bold">{project.title}</h1>

        <p className="text-zinc-500 mt-2">{project.type}</p>
        <p className="text-zinc-600 dark:text-zinc-400 mt-2">{project.tech}</p>

        <p className="mt-8 text-lg max-w-2xl">
          {project.description}
        </p>

        <a
          href={project.github}
          target="_blank"
          className="inline-block mt-8 px-5 py-2 bg-black text-white dark:bg-white dark:text-black rounded-full"
        >
          GitHub
        </a>

      </main>
    </>
  );
}