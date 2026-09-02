import Navbar from "@/components/Navbar";
import Link from "next/link";
import Image from "next/image";
import RippleRings from "@/components/RippleRings";
import { certifications } from "@/lib/certifications";

export default function CertificationsPage() {
  return (
    <>
      <Navbar />

      <main className="relative isolate overflow-hidden min-h-screen px-6 py-16 bg-zinc-50 dark:bg-black text-black dark:text-white">
        <RippleRings top={160} height={400} />

        <Link href="/" className="text-sm underline text-zinc-600 dark:text-zinc-400">
          ← Back Home
        </Link>

        <h1 className="text-4xl font-bold mt-6">Certifications</h1>

        <div className="mt-10 grid gap-6 max-w-3xl sm:grid-cols-2">
          {certifications.map((cert) => (
            <div
              key={cert.slug}
              className="border rounded-xl overflow-hidden flex flex-col"
            >
              <div className="relative w-full aspect-[4/3] bg-zinc-100 dark:bg-zinc-900">
                <Image
                  src={cert.image}
                  alt={cert.title}
                  fill
                  sizes="(min-width: 640px) 384px, 100vw"
                  className="object-cover"
                />
              </div>

              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-start justify-between gap-4">
                  <h2 className="text-xl font-semibold">{cert.title}</h2>

                  {cert.badge && (
                    <div className="relative h-24 w-24 sm:h-28 sm:w-28 flex-shrink-0 rounded-md overflow-hidden shadow-sm">
                      <Image
                        src={cert.badge}
                        alt={`${cert.title} badge`}
                        fill
                        sizes="112px"
                        className="object-contain"
                      />
                    </div>
                  )}
                </div>

                <p className="text-zinc-600 dark:text-zinc-400 mt-2 text-sm">
                  {cert.tags.join(" • ")}
                </p>

                <Link
                  href={`/certifications/${cert.slug}`}
                  className="mt-auto pt-4 inline-block text-sm font-medium underline"
                >
                  View Details →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}