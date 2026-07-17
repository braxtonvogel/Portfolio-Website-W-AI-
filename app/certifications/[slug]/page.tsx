import Navbar from "@/components/Navbar";
import { notFound } from "next/navigation";
import { certifications } from "@/lib/certifications";
import CertificationScrollExperience from "@/components/CertificationScrollExperience";

export function generateStaticParams() {
  return certifications.map((cert) => ({ slug: cert.slug }));
}

export default async function CertificationDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cert = certifications.find((c) => c.slug === slug);

  if (!cert) notFound();

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-30 bg-zinc-50/70 dark:bg-black/70 backdrop-blur-sm">
        <Navbar />
      </div>
      <CertificationScrollExperience cert={cert} />
    </>
  );
}