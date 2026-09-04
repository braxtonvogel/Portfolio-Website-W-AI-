import Navbar from "@/components/Navbar";
import GlyphRain from "@/components/GlyphRain";
import Link from "next/link";
import ViewTransitionLink from "@/components/ViewTransitionLink";
import Image from "next/image";
import { certifications } from "@/lib/certifications";
import { SITE_NAV_BRAND, SITE_NAV_PINNED, siteNavItems } from "@/lib/siteNav";

export default function CertificationsPage() {
  return (
    <>
      <Navbar brand={SITE_NAV_BRAND} pinned={SITE_NAV_PINNED} items={siteNavItems("certifications")} />

      {/* pt clears the fixed 48px nav plus the page's own top margin */}
      <main className="relative isolate min-h-screen px-6 pt-28 pb-16 bg-zinc-50 dark:bg-black text-black dark:text-white">
        {/* the glyph rain sinks behind everything on the page, viewport-fixed */}
        <GlyphRain />

        <ViewTransitionLink href="/" className="text-sm underline text-zinc-600 dark:text-zinc-400">
          ← Back Home
        </ViewTransitionLink>

        <h1 className="text-4xl font-bold mt-6">Certifications</h1>

        <div className="mt-10 grid gap-6 max-w-3xl sm:grid-cols-2">
          {certifications.map((cert) => (
            <div
              key={cert.slug}
              className="border rounded-xl overflow-hidden flex flex-col bg-white/80 dark:bg-black/70 border-zinc-200 dark:border-zinc-800"
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
