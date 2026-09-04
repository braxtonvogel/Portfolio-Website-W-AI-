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
    // no site nav here: the scroll experience carries its own fixed
    // "back to certifications" control top-left, which a bar would sit on.
    // (The old wrapper rendered an empty Navbar stub - nothing visible - but
    // still cost a full-width backdrop-filter layer every frame.)
    <CertificationScrollExperience cert={cert} />
  );
}