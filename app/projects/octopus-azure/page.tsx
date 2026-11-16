"use client";

import Navbar from "@/components/Navbar";
import ViewTransitionLink from "@/components/ViewTransitionLink";
import { useState } from "react";
import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/lib/useMediaQuery";
import { SITE_NAV_BRAND, SITE_NAV_PINNED, siteNavItems } from "@/lib/siteNav";
import styles from "../taskflow/taskflow.module.css";
import o from "./octopus.module.css";
import FlipStack, { LIVE_URL, dropBg, fadeUp } from "./FlipStack";

const PIPELINE: [string, string][] = [
  ["Code", ".NET 11 Razor Pages"],
  ["GitHub Actions", "Build the container image"],
  ["GHCR", "Push the image"],
  ["Octopus Deploy", "Create a release"],
  ["Azure Container Apps", "Deploy the revision"],
];

const STATS: [string, string][] = [
  ["Language", "C# / .NET 11"],
  ["UI", "Razor Pages"],
  ["Persistence", "EF Core + Azure SQL"],
  ["Host", "Azure Container Apps"],
  ["CI", "GitHub Actions → GHCR"],
  ["Release", "Octopus Deploy"],
];

function PipelineArrow() {
  return (
    <div className={`${styles.layerArrow} ${o.pipeArrow}`} aria-hidden="true">
      <span className={o.arrowRight}>→</span>
      <span className={o.arrowDown}>↓</span>
    </div>
  );
}

export default function OctopusAzureProject() {
  const [dark, setDark] = useState(true);
  const reducedMotion = usePrefersReducedMotion();

  return (
    <div className={`${styles.page} ${o.root}`} data-theme={dark ? "dark" : "light"}>
      <Navbar brand={SITE_NAV_BRAND} pinned={SITE_NAV_PINNED} items={siteNavItems("projects")} variant="dark" />

      <button
        type="button"
        onClick={() => setDark((d) => !d)}
        className={`${styles.themeToggle} ${o.focusRing}`}
        aria-label="Toggle light and dark mode for this page"
      >
        {dark ? "☀" : "☾"} {dark ? "Light" : "Dark"}
      </button>

      {/* ================= S1: HERO ================= */}
      <div className={styles.hero}>
        <motion.div {...fadeUp(reducedMotion)}>
          <ViewTransitionLink href="/early-development" className={`${styles.backLink} ${o.focusRing}`}>
            ← Back to Early Dev
          </ViewTransitionLink>

          <div className={styles.badgeRow}>
            <span className={`${styles.badge} ${styles.badgeLive}`}>Live on Azure</span>
            <span className={`${styles.badge} ${o.badgeMeta}`}>Nov 2026</span>
            <span className={`${styles.badge} ${o.badgeMeta}`}>Jeffrey Palermo</span>
            <span className={`${styles.badge} ${o.badgeMeta}`}>DevOps</span>
            <ViewTransitionLink
              href="/early-development"
              className={`${styles.badge} ${styles.badgeNote} ${o.focusRing}`}
            >
              Also a Field Note ↗
            </ViewTransitionLink>
          </div>

          <h1 className={styles.title}>Octopus + Azure: Shipping a .NET 11 App</h1>
          <p className={styles.tagline}>
            .NET 11 • Razor Pages • EF Core • Azure SQL • GitHub Actions • GHCR • Octopus Deploy • Azure Container Apps
          </p>

          <div className={styles.linkRow}>
            <a
              href={LIVE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.btnPrimary} ${o.focusRing}`}
            >
              Open live app
            </a>
          </div>
        </motion.div>
      </div>

      {/* ================= S2: PIPELINE ================= */}
      <section className={styles.chapter}>
        <motion.div {...dropBg(reducedMotion, "var(--panel-arch)")} />
        <div className={styles.chapterInner}>
          <span className={styles.kicker}>Pipeline</span>
          <h2 className={styles.chapterTitle}>From commit to a live URL</h2>
          <motion.p {...fadeUp(reducedMotion)} className={`${styles.body} ${o.body}`}>
            The path is a straight line: the app is built in GitHub Actions, stored in GHCR, released by Octopus
            Deploy, and hosted on Azure Container Apps.
          </motion.p>
          <motion.div {...fadeUp(reducedMotion, 0.2)} className={o.stackWrap}>
            <div
              className={`${styles.layerStack} ${o.pipeline}`}
              aria-label="Deployment pipeline: Code, GitHub Actions, GHCR, Octopus Deploy, Azure Container Apps, Live"
            >
              {PIPELINE.map(([name, desc]) => (
                <div key={name} className={o.pipeStep}>
                  <div className={`${styles.layer} ${o.pipeLayer}`}>
                    <div className={styles.layerName}>{name}</div>
                    <div className={`${styles.layerDesc} ${o.pipeDesc}`}>{desc}</div>
                  </div>
                  <PipelineArrow />
                </div>
              ))}
              <div className={`${styles.layer} ${o.pipeLayer}`}>
                <div className={styles.layerName}>Live</div>
                <div className={`${styles.layerDesc} ${o.pipeDesc}`}>
                  <a
                    href={LIVE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${o.liveLink} ${o.focusRing}`}
                  >
                    {LIVE_URL}
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ================= S3: THE STACK ================= */}
      <section className={styles.chapter}>
        <motion.div {...dropBg(reducedMotion, "var(--panel-overview)")} />
        <div className={styles.chapterInner}>
          <span className={styles.kicker}>The Stack</span>
          <h2 className={styles.chapterTitle}>A .NET 11 Razor Pages app on Azure SQL</h2>
          <div className={styles.chapterGrid}>
            <motion.p {...fadeUp(reducedMotion)} className={styles.body}>
              The app is a .NET 11 Razor Pages project. Entity Framework Core talks to Azure SQL. That is the thing
              the rest of the pipeline builds, stores, and deploys.
            </motion.p>
            <motion.div {...fadeUp(reducedMotion, 0.15)}>
              <div className={styles.statCard}>
                {STATS.map(([key, val]) => (
                  <div key={key} className={styles.statRow}>
                    <span className={styles.statKey}>{key}</span>
                    <span className={styles.statVal}>{val}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ================= S4-S9: STICKY FLIP ================= */}
      <FlipStack reduced={reducedMotion} />

      <div className={styles.footer} />
    </div>
  );
}
