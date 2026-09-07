"use client";

import Navbar from "@/components/Navbar";
import ViewTransitionLink from "@/components/ViewTransitionLink";
import { useState } from "react";
import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/lib/useMediaQuery";
import { SITE_NAV_BRAND, SITE_NAV_PINNED, siteNavItems } from "@/lib/siteNav";
import styles from "./taskflow.module.css";

const LIVE_API_URL =
  "https://taskflow-braxton-dwcbdtc0gsfwe9bg.westus-01.azurewebsites.net/api/boards";
const PDF_URL = "/growth-notes/taskflow-field-notes.pdf";

const ENDPOINTS: [string, string, string][] = [
  ["GET", "/api/boards", "List boards with their items"],
  ["GET", "/api/boards/{id}", "Get one board"],
  ["POST", "/api/boards", "Create a board"],
  ["POST", "/api/boards/{boardId}/items", "Add a work item to a board"],
  ["POST", "/api/boards/{boardId}/items/{workItemId}/start", "Move an item to InProgress"],
  ["POST", "/api/boards/{boardId}/items/{workItemId}/complete", "Move an item to Done"],
];

const SKILLS = [
  "C# / ASP.NET Core Web API",
  "Onion / Clean Architecture",
  "Entity Framework Core (SQLite)",
  "Domain-driven business rules & unit testing",
  "Azure App Service (Linux)",
  "CI/CD pipeline design (Azure Pipelines & GitHub Actions)",
  "Azure Policy & Conditional Access troubleshooting",
  "Production incident diagnosis (quota exhaustion, crash loops)",
];

// Both animations only ever touch opacity/transform (never layout-triggering
// properties), which is what keeps them cheap to composite even with ~15
// separate viewport-triggered reveals on one page. `reduced` additionally
// drops the translateY movement and shortens the transition when the visitor
// has prefers-reduced-motion set - both a11y correctness and less work on
// underpowered devices, since there's nothing left to animate but a fade.
function fadeUp(reduced: boolean, delay = 0) {
  return {
    initial: { opacity: 0, y: reduced ? 0 : 28 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.35 },
    transition: reduced
      ? { duration: 0.2 }
      : { duration: 0.6, delay, ease: [0.2, 0.8, 0.2, 1] as const },
  };
}

function dropBg(reduced: boolean, background: string) {
  return {
    initial: { opacity: 0, y: reduced ? 0 : -48 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.15 },
    transition: reduced ? { duration: 0.2 } : { duration: 0.7, ease: [0.2, 0.8, 0.2, 1] as const },
    style: { background },
    className: styles.chapterBg,
  };
}

export default function TaskFlowProject() {
  const [dark, setDark] = useState(true);
  const reducedMotion = usePrefersReducedMotion();

  return (
    <div className={styles.page} data-theme={dark ? "dark" : "light"}>
      <Navbar brand={SITE_NAV_BRAND} pinned={SITE_NAV_PINNED} items={siteNavItems("projects")} />

      <button
        type="button"
        onClick={() => setDark((d) => !d)}
        className={styles.themeToggle}
        aria-label="Toggle light and dark mode for this page"
      >
        {dark ? "☀" : "☾"} {dark ? "Light" : "Dark"}
      </button>

      {/* ================= HERO ================= */}
      <div className={styles.hero}>
        <ViewTransitionLink href="/" className={styles.backLink}>
          ← Back to Home
        </ViewTransitionLink>

        <div className={styles.badgeRow}>
          <span className={`${styles.badge} ${styles.badgeLive}`}>Live on Azure</span>
          <ViewTransitionLink href="/early-development" className={`${styles.badge} ${styles.badgeNote}`}>
            Also a Field Note ↗
          </ViewTransitionLink>
        </div>

        <h1 className={styles.title}>TaskFlow</h1>
        <p className={styles.tagline}>
          C# • ASP.NET Core • Onion Architecture • EF Core • Azure App Service • GitHub Actions
        </p>

        <div className={styles.linkRow}>
          <a href="https://github.com/braxtonvogel/TaskFlow" target="_blank" className={styles.btnPrimary}>
            View GitHub Repository
          </a>
          <a href={LIVE_API_URL} target="_blank" className={styles.btnGhost}>
            <span className={styles.dot} /> Live API
          </a>
        </div>
      </div>

      {/* ================= CHAPTER: OVERVIEW ================= */}
      <section className={styles.chapter}>
        <motion.div {...dropBg(reducedMotion, "var(--panel-overview)")} />
        <div className={styles.chapterInner}>
          <span className={styles.kicker}>Overview</span>
          <h2 className={styles.chapterTitle}>A small API, built for a specific audience</h2>
          <div className={styles.chapterGrid}>
            <motion.p {...fadeUp(reducedMotion)} className={styles.body}>
              TaskFlow is a small ASP.NET Core Web API — a task/project tracker — built to demonstrate
              Onion Architecture (the layering pattern originated by Jeffrey Palermo, CTO of Clear
              Measure) and a real deployment pipeline to Azure. The functionality itself is
              intentionally minimal; the point is the architecture and delivery pipeline around it.
            </motion.p>
            <motion.div {...fadeUp(reducedMotion, 0.15)}>
              <div className={styles.statCard}>
                <div className={styles.statRow}>
                  <span className={styles.statKey}>Language</span>
                  <span className={styles.statVal}>C# / .NET</span>
                </div>
                <div className={styles.statRow}>
                  <span className={styles.statKey}>Pattern</span>
                  <span className={styles.statVal}>Onion Architecture</span>
                </div>
                <div className={styles.statRow}>
                  <span className={styles.statKey}>Persistence</span>
                  <span className={styles.statVal}>EF Core + SQLite</span>
                </div>
                <div className={styles.statRow}>
                  <span className={styles.statKey}>Host</span>
                  <span className={styles.statVal}>Azure App Service (Linux)</span>
                </div>
                <div className={styles.statRow}>
                  <span className={styles.statKey}>Pipeline</span>
                  <span className={styles.statVal}>GitHub Actions</span>
                </div>
                <div className={styles.statRow}>
                  <span className={styles.statKey}>Status</span>
                  <span className={styles.statVal}>Running</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ================= CHAPTER: ARCHITECTURE ================= */}
      <section className={styles.chapter}>
        <motion.div {...dropBg(reducedMotion, "var(--panel-arch)")} />
        <div className={styles.chapterInner}>
          <span className={styles.kicker}>Architecture</span>
          <h2 className={styles.chapterTitle}>Dependencies point inward</h2>
          <div className={styles.chapterGrid}>
            <motion.p {...fadeUp(reducedMotion)} className={styles.body}>
              Dependencies point inward: <code>Api → Infrastructure → Application → Domain</code>. A{" "}
              <code>WorkItem</code> can only move{" "}
              <code>Backlog → InProgress → Done</code> — that rule lives in the entity itself, not a
              controller, so it can&apos;t be bypassed. It surfaces as a <code>409 Conflict</code> if
              you try to complete an item that was never started, and the whole thing is proven with a
              test suite that never touches a database — a fake in-memory repository stands in for
              Infrastructure.
            </motion.p>
            <motion.div {...fadeUp(reducedMotion, 0.2)}>
              <div className={styles.layerStack}>
                <div className={styles.layer}>
                  <div className={styles.layerName}>TaskFlow.Api</div>
                  <div className={styles.layerDesc}>Controllers + composition root</div>
                </div>
                <div className={styles.layerArrow}>depends on ↓</div>
                <div className={styles.layer}>
                  <div className={styles.layerName}>TaskFlow.Infrastructure</div>
                  <div className={styles.layerDesc}>EF Core (SQLite) persistence</div>
                </div>
                <div className={styles.layerArrow}>depends on ↓</div>
                <div className={styles.layer}>
                  <div className={styles.layerName}>TaskFlow.Application</div>
                  <div className={styles.layerDesc}>Use-case services, DTOs, repository interfaces</div>
                </div>
                <div className={styles.layerArrow}>depends on ↓</div>
                <div className={styles.layer}>
                  <div className={styles.layerName}>TaskFlow.Domain</div>
                  <div className={styles.layerDesc}>Entities + business rules — depends on nothing</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ================= CHAPTER: ENDPOINTS ================= */}
      <section className={styles.chapter}>
        <motion.div {...dropBg(reducedMotion, "var(--panel-endpoints)")} />
        <div className={styles.chapterInner}>
          <span className={styles.kicker}>API</span>
          <h2 className={styles.chapterTitle}>Six endpoints, one state machine</h2>
          <div className={styles.chapterGrid}>
            <motion.p {...fadeUp(reducedMotion)} className={styles.body}>
              The whole surface area of the API is boards and the work items inside them. Every write
              that touches a work item&apos;s status routes through the same domain rule described
              above — there&apos;s no second code path that skips it.
            </motion.p>
            <motion.div {...fadeUp(reducedMotion, 0.2)}>
              <div className={styles.endpointTable}>
                {ENDPOINTS.map(([method, route, desc]) => (
                  <div key={method + route} className={styles.endpointRow}>
                    <span className={styles.method}>{method}</span>
                    <div>
                      <div className={styles.route}>{route}</div>
                      <div className={styles.routeDesc}>{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ================= CHAPTER: FIELD NOTES ================= */}
      <section className={styles.chapter}>
        <motion.div {...dropBg(reducedMotion, "var(--panel-notes)")} />
        <div className={styles.chapterInner}>
          <div className={styles.notesHeader}>
            <div>
              <span className={styles.kicker}>Field Notes</span>
              <h2 className={styles.chapterTitle}>What &quot;Enterprise Azure&quot; Actually Looks Like</h2>
            </div>
            <a href={PDF_URL} target="_blank" rel="noopener noreferrer" className={styles.pdfBtn}>
              Open as PDF ↗
            </a>
          </div>
          <motion.div {...fadeUp(reducedMotion, 0.1)} className={styles.pdfEmbed}>
            <iframe src={`${PDF_URL}#toolbar=0`} title="TaskFlow Field Notes" />
          </motion.div>
        </div>
      </section>

      {/* ================= CHAPTER: SKILLS ================= */}
      <section className={styles.chapter}>
        <motion.div {...dropBg(reducedMotion, "var(--panel-skills)")} />
        <div className={styles.chapterInner}>
          <span className={styles.kicker}>Skills Gained</span>
          <h2 className={styles.chapterTitle}>What this project actually proved</h2>
          <div className={styles.skillsGrid}>
            {SKILLS.map((s, i) => (
              <motion.div key={s} {...fadeUp(reducedMotion, (i % 4) * 0.06)} className={styles.skillItem}>
                <span>▸</span>
                <span>{s}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <div className={styles.footer} />
    </div>
  );
}

/* ================= METADATA ================= */
export const projectMeta = {
  title: "TaskFlow",
  type: "Personal Project",
  tech: "C# • ASP.NET Core • Onion Architecture • EF Core • Azure App Service • GitHub Actions",
  skills: SKILLS,
};
