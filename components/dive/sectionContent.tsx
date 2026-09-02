import Link from "next/link";
import styles from "./dive.module.css";
import { certifications } from "@/lib/certifications";
import { growthNotes } from "@/lib/growthNotes";
import { projects, skills } from "@/lib/portfolioData";
import { CONTACT_EMAIL, CONTACT_PHONE } from "@/lib/contact";
import type { Section } from "./sections";

const note = growthNotes[0];

function submitContact(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
  const form = e.currentTarget;
  const name = (form.elements.namedItem("name") as HTMLInputElement).value;
  const email = (form.elements.namedItem("email") as HTMLInputElement).value;
  const phone = (form.elements.namedItem("phone") as HTMLInputElement).value;
  const message = (form.elements.namedItem("message") as HTMLTextAreaElement).value;

  const subject = `Portfolio Contact from ${name}`;
  const body = [`Name: ${name}`, `Email: ${email}`, `Phone: ${phone || "Not provided"}`, "", "Message:", message].join("\n");

  window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/**
 * The real content for each of the six world sections, shared between the 3D
 * world panels and the flat mobile fallback so nothing is duplicated.
 *
 * `renderPdf` gates the early-dev PDF iframe: all six panels exist in the DOM
 * simultaneously inside the animated 3D world, so a live-rendering iframe left
 * mounted for panels the user isn't even looking at is expensive to keep
 * compositing through every world rotation. The world only passes true for
 * the currently active panel; the mobile fallback (a normal scrolling page,
 * no ongoing 3D animation) always passes true.
 */
export function getSectionContent(section: Section, renderPdf: boolean): React.ReactNode {
  switch (section) {
    case "education":
      return (
        <>
          <h2 className={styles.secTitle}>Education</h2>
          <p className={styles.lead}>Sam Houston State University &mdash; SHSU</p>
          <p className={styles.secBody}>
            Bachelor of Science in Software Engineering, Huntsville, Texas. Built through independent projects,
            collaborative coursework, and self-driven exploration outside the classroom.
          </p>
          <div className={styles.pills}>
            <span className={styles.pill}>General GPA 3.4</span>
            <span className={styles.pill}>Major GPA 3.6</span>
            <span className={styles.pill}>2024 &ndash; Present</span>
          </div>
        </>
      );
    case "certifications":
      return (
        <>
          <h2 className={styles.secTitle}>Certifications</h2>
          <div className={styles.pills}>
            {certifications.map((c) => (
              <span key={c.slug} className={styles.pill}>
                {c.title}
              </span>
            ))}
          </div>
          <Link href="/certifications" className="text-white underline text-lg">
            View all certifications &rarr;
          </Link>
        </>
      );
    case "early":
      return (
        <>
          <h2 className={styles.secTitle}>Early Personal Development</h2>
          <div className={styles.pdfRow}>
            <div className={styles.pdfCol}>
              <p className={styles.lead}>{note.title}</p>
              <p className={styles.secBody}>{note.description}</p>
              <div className={styles.pills}>
                <span className={styles.pill}>{note.date}</span>
                {note.person && <span className={styles.pill}>{note.person}</span>}
                <span className={styles.pill}>{note.topic}</span>
              </div>
              <Link href="/early-development" className="text-white underline text-lg">
                View details &rarr;
              </Link>
            </div>
            <div className={styles.pdfFrame}>
              {renderPdf && <iframe src={`${note.pdf}#toolbar=0`} title={`${note.title} preview`} />}
            </div>
          </div>
        </>
      );
    case "projects":
      return (
        <>
          <h2 className={styles.secTitle}>Projects</h2>
          <div className={styles.proj}>
            {projects.map((p) => (
              <Link key={p.href} href={p.href}>
                {p.short}
                <span>{p.tech}</span>
              </Link>
            ))}
          </div>
        </>
      );
    case "skills":
      return (
        <>
          <h2 className={styles.secTitle}>Skills</h2>
          <div className={styles.skillGroups}>
            <div className={styles.skillGroup}>
              <p className={styles.skillGroupTitle}>Technical</p>
              <div className={styles.pills}>
                {skills.technical.map((s) => (
                  <span key={s.name} className={styles.pill}>
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
            <div className={styles.skillGroup}>
              <p className={styles.skillGroupTitle}>Interpersonal</p>
              <div className={styles.pills}>
                {skills.interpersonal.map((s) => (
                  <span key={s.name} className={styles.pill}>
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
            <div className={styles.skillGroup}>
              <p className={styles.skillGroupTitle}>Professional</p>
              <div className={styles.pills}>
                {skills.professional.map((s) => (
                  <span key={s.name} className={styles.pill}>
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </>
      );
    case "contact":
      return (
        <>
          <h2 className={styles.secTitle}>Contact</h2>
          <p className={styles.secBody}>
            {CONTACT_EMAIL} &middot; {CONTACT_PHONE}
          </p>
          <form className="space-y-3 pointer-events-auto" onSubmit={submitContact}>
            <input name="name" placeholder="Your Name" className={styles.field} required />
            <input name="email" placeholder="Your Email" className={styles.field} required />
            <input name="phone" placeholder="Your Phone (optional)" className={styles.field} />
            <textarea name="message" placeholder="Your Message" rows={3} className={styles.field} required />
            <button
              type="submit"
              className="px-6 py-2.5 border border-white rounded-lg text-white text-base hover:bg-white hover:text-black transition"
            >
              Send Message
            </button>
          </form>
        </>
      );
  }
}
