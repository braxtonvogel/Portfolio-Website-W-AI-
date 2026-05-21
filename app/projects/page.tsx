import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function ProjectsPage() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen px-6 py-16 bg-zinc-50 dark:bg-black text-black dark:text-white">

        <h1 className="text-4xl font-bold mt-6">Projects</h1>

        <p className="text-zinc-500 mt-2">
          A collection of my software engineering work
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">

          <Link href="/projects/chat-server"
            className="group p-6 border rounded-2xl bg-white dark:bg-zinc-900
                       transition-all duration-300 hover:-translate-y-2 hover:shadow-lg">

            <p className="text-xs text-zinc-500 uppercase">Personal</p>
            <h2 className="text-xl font-semibold mt-3 group-hover:translate-x-1 transition">
              Chat Server
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2 opacity-0 group-hover:opacity-100 transition">
              Python • Networking
            </p>
          </Link>

          <Link href="/projects/dnd-builder"
            className="group p-6 border rounded-2xl bg-white dark:bg-zinc-900
                       transition-all duration-300 hover:-translate-y-2 hover:shadow-lg">

            <p className="text-xs text-zinc-500 uppercase">Group</p>
            <h2 className="text-xl font-semibold mt-3 group-hover:translate-x-1 transition">
              D&D Builder
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2 opacity-0 group-hover:opacity-100 transition">
              SQL • Database
            </p>
          </Link>

          <Link href="/projects/file-manager"
            className="group p-6 border rounded-2xl bg-white dark:bg-zinc-900
                       transition-all duration-300 hover:-translate-y-2 hover:shadow-lg">

            <p className="text-xs text-zinc-500 uppercase">Personal</p>
            <h2 className="text-xl font-semibold mt-3 group-hover:translate-x-1 transition">
              File Manager
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2 opacity-0 group-hover:opacity-100 transition">
              React • UI/UX
            </p>
          </Link>

        </div>
      </main>
    </>
  );
}