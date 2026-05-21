import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function CertificationsPage() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen px-6 py-16 bg-zinc-50 dark:bg-black text-black dark:text-white">

        <Link href="/" className="text-sm underline text-zinc-600 dark:text-zinc-400">
          ← Back Home
        </Link>

        <h1 className="text-4xl font-bold mt-6">Certifications</h1>

        <div className="mt-10 space-y-6 max-w-3xl">

          <div className="p-6 border rounded-xl">
            <h2 className="text-xl font-semibold">
              Google Data Analytics Certificate
            </h2>

            <p className="text-zinc-600 dark:text-zinc-400 mt-2">
              SQL • Data Cleaning • Visualization • R
            </p>
          </div>

        </div>
      </main>
    </>
  );
}