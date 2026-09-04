"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { certifications } from "@/lib/certifications";
import { projects, skills } from "@/lib/portfolioData";
import { CONTACT_EMAIL, CONTACT_PHONE } from "@/lib/contact";

type Message = {
  role: "user" | "ai";
  content: string;
};

/* ================= KNOWLEDGE BASE ================= */
const knowledgeBase = {
  languages: {
    python:
      "Yes — Braxton has extensive Python experience from multiple projects including his Student Risk Prediction System and Stateful Browser Automation Engine.",

    java:
      "Yes — Braxton has Java experience from his Chat Server and D&D Character Builder projects.",

    rust:
      "Yes — Braxton has Rust experience from SammyOS, where he used it to build the backend core of a cross-platform desktop productivity platform.",

    html:
      "Yes — Braxton has HTML experience from his File Manager UI project.",

    sql:
      "Yes — Braxton has SQL experience from his D&D Character Builder Database System.",

    javascript:
      "Yes — Braxton has vanilla JavaScript and DOM manipulation experience from his File Manager UI project — a framework-free build with its own hand-rolled virtual filesystem.",
  },

  frameworks: {
    springboot:
      "Yes — Braxton has Spring Boot backend experience from his D&D Character Builder Database System.",

    react:
      "Yes — Braxton has React experience from this portfolio site (built with Next.js and React) and SammyOS's Next.js frontend.",

    nextjs:
      "Yes — Braxton has Next.js experience from SammyOS and this portfolio site.",

    tauri:
      "Yes — Braxton has Tauri experience from SammyOS, where he used it to build a cross-platform desktop application combining a Rust backend with a Next.js frontend.",

    zustand:
      "Yes — Braxton has Zustand state management experience from SammyOS.",

    redis:
      "Yes — Braxton has Redis experience from SammyOS, using Upstash for serverless key-value storage and caching.",

    upstash:
      "Yes — Braxton has Upstash (serverless Redis) experience from SammyOS.",

    streamlit:
      "Yes — Braxton has Streamlit dashboard and web app experience from his Student Risk Prediction System.",

    playwright:
      "Yes — Braxton has Playwright browser automation experience from his Stateful Browser Automation Engine.",

    chromium:
      "Yes — Braxton has Chromium automation experience from his Stateful Browser Automation Engine.",

    shap:
      "Yes — Braxton has SHAP explainability experience from his Student Risk Prediction System's analysis notebook, identifying each student's top individual risk factors.",

    llama3:
      "Yes — Braxton has Llama 3 integration experience from his Student Risk Prediction System.",

    nova:
      "Yes — Braxton has Nova LLM integration experience from his Student Risk Prediction System.",

    scikitlearn:
      "Yes — Braxton has Scikit-learn experience from his Student Risk Prediction System.",

    llama:
      "Yes — Braxton has Llama 3 LLM integration experience from his Student Risk Prediction System.",

    novallm:
      "Yes — Braxton has Nova LLM integration experience from his Student Risk Prediction System.",

    llmintegration:
      "Yes — Braxton has large language model integration experience using Nova and Llama 3.",

    frontenddesign:
      "Yes — Braxton has frontend design experience from his File Manager UI project.",
  },

  concepts: {
    machinelearning:
      "Yes — Braxton has machine learning experience from his Student Risk Prediction System.",

    ml:
      "Yes — Braxton has machine learning experience from his Student Risk Prediction System.",

    randomforest:
      "Yes — Braxton has Random Forest model experience from his Student Risk Prediction System.",

    featureengineering:
      "Yes — Braxton has feature engineering experience from his Student Risk Prediction System.",

    datascience:
      "Yes — Braxton has data science experience from his Student Risk Prediction System.",

    datavisualization:
      "Yes — Braxton has data visualization experience from his Student Risk Prediction System.",

    datasets:
      "Yes — Braxton has real-world dataset handling experience using the OULAD dataset in his Student Risk Prediction System.",

    datasetanalysis:
      "Yes — Braxton has dataset analysis experience from his Student Risk Prediction System.",

    ai:
      "Yes — Braxton has AI integration experience from his Student Risk Prediction System and SammyOS.",

    explainability:
      "Yes — Braxton has AI explainability and feature importance analysis experience using SHAP.",

    featureimportance:
      "Yes — Braxton has feature importance analysis experience using SHAP in his Student Risk Prediction System.",

    llm:
      "Yes — Braxton has large language model integration experience using Nova and Llama 3, as well as multi-LLM routing in SammyOS.",

    multillm:
      "Yes — Braxton has multi-LLM routing experience from SammyOS, intelligently routing tasks across multiple language models.",

    llmrouting:
      "Yes — Braxton has LLM routing and orchestration experience from SammyOS.",

    contextaware:
      "Yes — Braxton has context-aware system design experience from SammyOS, a productivity platform that adapts to user context in real time.",

    desktopapp:
      "Yes — Braxton has cross-platform desktop application experience from SammyOS using Tauri.",

    systemsprogramming:
      "Yes — Braxton has systems programming experience from SammyOS using Rust for the backend core.",

    statemanagement:
      "Yes — Braxton has frontend state management experience from SammyOS using Zustand.",

    caching:
      "Yes — Braxton has caching and key-value store experience from SammyOS using Redis via Upstash.",

    productivity:
      "Yes — Braxton has experience building AI-powered productivity tools from SammyOS.",

    sammyos:
      "SammyOS is Braxton's most ambitious personal project — a context-aware AI productivity platform built with Tauri, Next.js, Rust, Zustand, Redis (Upstash), and multi-LLM routing.",

    insightgeneration:
      "Yes — Braxton has AI-driven insight generation experience using LLM integration.",

    backend:
      "Yes — Braxton has backend engineering experience from projects including his D&D Character Builder, Chat Server, and SammyOS.",

    modularbackend:
      "Yes — Braxton has modular backend structure experience from his Student Risk Prediction System and backend projects.",

    frontend:
      "Yes — Braxton has frontend development experience from his File Manager UI project and SammyOS.",

    fullstack:
      "Yes — Braxton has full-stack development experience from his D&D Character Builder Database System and SammyOS.",

    fullstackintegration:
      "Yes — Braxton has full-stack integration experience from his D&D Character Builder Database System.",

    mvc:
      "Yes — Braxton has MVC architecture experience from his D&D Character Builder Database System.",

    database:
      "Yes — Braxton has relational database design experience from his D&D Character Builder Database System.",

    relationalmodeling:
      "Yes — Braxton has relational database modeling experience from his D&D Character Builder Database System.",

    networking:
      "Yes — Braxton has networking experience from his Chat Server project.",

    sockets:
      "Yes — Braxton has socket programming experience from his Chat Server project.",

    clientserver:
      "Yes — Braxton has client-server architecture experience from his Chat Server project.",

    realtime:
      "Yes — Braxton has real-time messaging system experience from his Chat Server project.",

    networkdesign:
      "Yes — Braxton has network communication design experience from his Chat Server project.",

    multiclient:
      "Yes — Braxton has multi-client handling experience from his Chat Server project.",

    automation:
      "Yes — Braxton has automation workflow design experience from his Stateful Browser Automation Engine.",

    processautomation:
      "Yes — Braxton has process automation experience from his Stateful Browser Automation Engine.",

    workflowoptimization:
      "Yes — Braxton has workflow optimization experience from automation and frontend projects.",

    sessionmanagement:
      "Yes — Braxton has persistent session management experience from his Stateful Browser Automation Engine.",

    authentication:
      "Yes — Braxton has stateful authentication system experience from his Stateful Browser Automation Engine.",

    dynamicweb:
      "Yes — Braxton has dynamic web interaction experience from his Stateful Browser Automation Engine.",

    browserdebugging:
      "Yes — Braxton has browser workflow debugging experience from Playwright automation systems.",

    reusablesoftware:
      "Yes — Braxton has reusable software design experience from automation and backend projects.",

    uiux:
      "Yes — Braxton has UI/UX design experience from his File Manager UI project.",

    responsive:
      "Yes — Braxton has responsive frontend design experience from his File Manager UI project.",

    responsiveui:
      "Yes — Braxton has responsive UI system design experience from his File Manager UI project.",

    componentarchitecture:
      "Yes — Braxton has component-based architecture experience from React and Next.js frontend projects.",

    userinterface:
      "Yes — Braxton has user interface design experience from frontend and UI/UX projects.",

    designsystems:
      "Yes — Braxton has design consistency system experience from frontend UI/UX projects.",

    debugging:
      "Yes — Braxton has debugging experience across backend systems, automation tools, and frontend applications.",

    frontenddebugging:
      "Yes — Braxton has frontend debugging experience from React and UI development projects.",

    github:
      "Yes — Braxton has GitHub workflow and project management experience across multiple projects.",

    documentation:
      "Yes — Braxton has software documentation experience from multiple development projects.",

    research:
      "Yes — Braxton has research and technical documentation experience from multiple software projects.",

    datadriven:
      "Yes — Braxton has data-driven decision-making experience from machine learning and analytics projects.",

    criticalthinking:
      "Yes — Braxton has demonstrated critical thinking skills through machine learning and systems engineering projects.",

    strategicplanning:
      "Yes — Braxton has strategic planning experience from long-term software project development.",

    teamwork:
      "Yes — Braxton has teamwork and collaboration experience from group software engineering projects.",

    creativity:
      "Yes — Braxton has creative thinking experience demonstrated through UI/UX and software design projects.",

    security:
      "Yes — Braxton has basic security testing experience from his D&D Character Builder project.",

    softwarearchitecture:
      "Yes — Braxton has software architecture experience across backend, automation, ML systems, and SammyOS.",

    systemarchitecture:
      "Yes — Braxton has system architecture experience from backend, full-stack, and desktop development projects.",

    problemsolving:
      "Yes — Braxton has strong problem solving and innovation skills demonstrated through multiple engineering projects.",

    javadevelopment:
      "Yes — Braxton has Java development experience from his Chat Server and D&D Character Builder projects.",

    commandline:
      "Yes — Braxton has command-line application design experience from backend and networking projects.",

    projectstructuring:
      "Yes — Braxton has project structuring experience across multiple software engineering projects.",

    mlpipeline:
      "Yes — Braxton has machine learning pipeline design experience from his Student Risk Prediction System.",

    pythonarchitecture:
      "Yes — Braxton has Python project architecture experience from multiple software engineering projects.",

    dashboards:
      "Yes — Braxton has Streamlit dashboard development experience from his Student Risk Prediction System.",

    webapps:
      "Yes — Braxton has experience building interactive ML web applications using Streamlit.",

    predictionui:
      "Yes — Braxton has experience designing real-time prediction user interfaces using Streamlit.",

    riskprediction:
      "Yes — Braxton has experience building risk probability prediction systems in his Student Risk Prediction System.",

    oulad:
      "Yes — Braxton has experience working with the real-world OULAD educational dataset.",
  },

  about: {
    contact: `You can reach Braxton directly at ${CONTACT_EMAIL} or ${CONTACT_PHONE}, or use the contact form on this site.`,
    touch: `You can reach Braxton directly at ${CONTACT_EMAIL} or ${CONTACT_PHONE}, or use the contact form on this site.`,
    reach: `You can reach Braxton directly at ${CONTACT_EMAIL} or ${CONTACT_PHONE}, or use the contact form on this site.`,
    email: `Braxton's email is ${CONTACT_EMAIL}.`,
    phone: `Braxton's phone number is ${CONTACT_PHONE}.`,
    hire: `Reach out at ${CONTACT_EMAIL} or ${CONTACT_PHONE} — he'd be glad to talk.`,

    gpa: "Braxton has a 3.4 general GPA and a 3.6 major GPA, pursuing a B.S. in Software Engineering.",
    education:
      "Braxton is pursuing a B.S. in Software Engineering at Sam Houston State University (SHSU) in Huntsville, Texas, 2024 - present.",
    university: "Braxton attends Sam Houston State University (SHSU) in Huntsville, Texas.",
    shsu: "Braxton attends Sam Houston State University (SHSU) in Huntsville, Texas.",
    degree: "Braxton is pursuing a Bachelor of Science in Software Engineering.",

    certification: `Yes — Braxton holds the ${certifications.map((c) => c.title).join(", ")}. You can view it on the Certifications page.`,
    certifications: `Yes — Braxton holds the ${certifications.map((c) => c.title).join(", ")}. You can view it on the Certifications page.`,
    certificate: `Yes — Braxton holds the ${certifications.map((c) => c.title).join(", ")}. You can view it on the Certifications page.`,
  },
};

const FALLBACK =
  "That topic isn't explicitly listed, but I can help with his skills, projects, education, certifications, or how to get in touch.";

/* ================= LINKIFYING PROJECT/CERT/SKILL MENTIONS =================
 * The chat only ever says one of a small, fixed set of sentences (the
 * knowledgeBase strings above, plus FALLBACK and the opening note) - never
 * arbitrary text - so it's safe to scan those sentences for literal mentions
 * of a project, certification, or skill and turn just that word/phrase into
 * a real link, without needing an LLM in the loop.
 *
 * Projects and certifications get colored + underlined (obviously
 * clickable); skills stay visually identical to plain text - just
 * clickable - per how the Skills panel already treats them elsewhere. */
type LinkKind = "project" | "cert" | "skill";
type LinkTerm = { phrase: string; href: string; kind: LinkKind };

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const PROJECT_TERMS: LinkTerm[] = projects.flatMap((p) =>
  Array.from(new Set([p.title, p.short])).map((phrase) => ({ phrase, href: p.href, kind: "project" as const }))
);

const CERT_TERMS: LinkTerm[] = certifications.map((c) => ({
  phrase: c.title,
  href: `/certifications/${c.slug}`,
  kind: "cert" as const,
}));

function skillHref(name: string): string | undefined {
  return [...skills.technical, ...skills.interpersonal, ...skills.professional].find((s) => s.name === name)?.href;
}

// The shorter phrase actually used in the knowledgeBase prose above, mapped
// to the full skill name it represents (so its href can't drift out of sync
// with the Skills panel's own data). Deliberately not exhaustive: a skill
// with no confident, unambiguous match here just stays plain text, same as
// before - the only downside of an omission is a missed convenience, not a
// wrong link.
const SKILL_PHRASES: { phrase: string; skillName: string }[] = [
  { phrase: "Python", skillName: "Python" },
  { phrase: "Java", skillName: "Java" },
  { phrase: "SQL", skillName: "SQL & Relational Databases" },
  { phrase: "Client-Server Architecture", skillName: "Client-Server Architecture" },
  { phrase: "Networking", skillName: "Networking & Socket Programming" },
  { phrase: "Machine Learning", skillName: "Machine Learning (Random Forest)" },
  { phrase: "Random Forest", skillName: "Machine Learning (Random Forest)" },
  { phrase: "Feature Engineering", skillName: "Feature Engineering" },
  { phrase: "SHAP", skillName: "Model Explainability (SHAP)" },
  { phrase: "Playwright", skillName: "Browser Automation (Playwright / Chromium)" },
  { phrase: "Streamlit", skillName: "Streamlit Web Apps" },
  { phrase: "Chromium", skillName: "Browser Automation (Playwright / Chromium)" },
  { phrase: "Database Design", skillName: "Database Design" },
  { phrase: "UI/UX", skillName: "Vanilla JavaScript & DOM" },
  { phrase: "Data Visualization", skillName: "Data Visualization (Tableau)" },
  { phrase: "Tableau", skillName: "Data Visualization (Tableau)" },
  { phrase: "Software Architecture", skillName: "Software Architecture" },
  { phrase: "React", skillName: "React & Next.js Development" },
  { phrase: "Rust", skillName: "Rust (Systems Programming)" },
  { phrase: "Tauri", skillName: "Tauri Desktop App Development" },
  { phrase: "Redis", skillName: "Redis / Upstash (Caching & Rate Limiting)" },
  { phrase: "Multi-LLM", skillName: "Multi-LLM Integration & Provider Routing" },
  { phrase: "Teamwork", skillName: "Teamwork & Collaboration" },
  { phrase: "Critical Thinking", skillName: "Critical Thinking" },
  { phrase: "Problem Solving", skillName: "Problem Solving & Innovation" },
  { phrase: "Research", skillName: "Research & Documentation" },
  { phrase: "Creative Thinking", skillName: "Creative Thinking" },
  { phrase: "Data-Driven", skillName: "Data-Driven Decision Making" },
  { phrase: "Stakeholder Communication", skillName: "Stakeholder Communication" },
  { phrase: "GitHub Workflow", skillName: "GitHub Workflow" },
  { phrase: "Process Automation", skillName: "Process Automation" },
  { phrase: "Strategic Planning", skillName: "Strategic Planning" },
  { phrase: "Workflow Optimization", skillName: "Workflow Optimization" },
  { phrase: "MVC Architecture", skillName: "MVC Architecture" },
];

const SKILL_TERMS: LinkTerm[] = SKILL_PHRASES.flatMap(({ phrase, skillName }) => {
  const href = skillHref(skillName);
  return href ? [{ phrase, href, kind: "skill" as const }] : [];
});

// Longest phrase first, so e.g. the full "Stateful Browser Automation
// Engine" title wins over any shorter alternative that could also start
// matching at the same position.
const ALL_TERMS: LinkTerm[] = [...PROJECT_TERMS, ...CERT_TERMS, ...SKILL_TERMS].sort(
  (a, b) => b.phrase.length - a.phrase.length
);

const LINK_PATTERN = ALL_TERMS.length
  ? new RegExp(`\\b(${ALL_TERMS.map((t) => escapeRegExp(t.phrase)).join("|")})\\b`, "gi")
  : null;

function findTerm(matchedText: string): LinkTerm | undefined {
  const lower = matchedText.toLowerCase();
  return ALL_TERMS.find((t) => t.phrase.toLowerCase() === lower);
}

/** Splits an AI message into plain text and clickable Link nodes wherever it
 * names a project, certification, or skill. */
function linkifyMessage(text: string, onNavigate: () => void): React.ReactNode {
  if (!LINK_PATTERN) return text;
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;
  LINK_PATTERN.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = LINK_PATTERN.exec(text))) {
    if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index));
    const term = findTerm(match[0]);
    if (term) {
      nodes.push(
        <Link
          key={key++}
          href={term.href}
          onClick={onNavigate}
          className={term.kind === "skill" ? "cursor-pointer" : "text-blue-400 underline hover:text-blue-300"}
        >
          {match[0]}
        </Link>
      );
    } else {
      nodes.push(match[0]);
    }
    lastIndex = LINK_PATTERN.lastIndex;
  }
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}

/* ================= MATCHING ================= */
// Case/punctuation-insensitive: lowercase, and every non-alphanumeric character
// (spaces, periods, slashes, question marks...) becomes a word break. This is
// what lets "Next.js", "next js", and "nextjs" all resolve the same way, and -
// combined with matching whole *phrases* rather than raw substrings - is what
// stops "java" from firing inside "javascript", or "ai" from firing inside
// "email": neither is a standalone word/phrase in the message.
function normalize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

// Small, dependency-free edit distance - just enough to forgive a single
// typo/transposition ("pyhton", "reactjs" -> "react") without getting loose
// enough to match unrelated short words.
function editDistance(a: string, b: string): number {
  const dp: number[][] = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      // count a swapped adjacent pair ("pyhton" -> "python") as a single edit,
      // not two - it's one of the most common typing slips there is, and
      // plain Levenshtein would otherwise price it the same as two unrelated
      // substitutions and miss it under a strict threshold.
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        dp[i][j] = Math.min(dp[i][j], dp[i - 2][j - 2] + 1);
      }
    }
  }
  return dp[a.length][b.length];
}

const MAX_PHRASE_WORDS = 3;
const MAX_MATCHES = 3;

/** Finds up to MAX_MATCHES knowledge-base answers for a user message: exact
 * phrase matches first (checked as contiguous 1-3 word runs, squashed, so
 * multi-word keys like "springboot" match "spring boot" typed either way),
 * then a light typo-tolerant pass over single words for anything still
 * unmatched. Longer keywords get a little more spelling leeway since a
 * one-character slip matters less on a long word than a short one. */
function findMatches(input: string): string[] {
  const words = normalize(input);
  if (words.length === 0) return [];

  const phrases = new Set<string>();
  for (let n = 1; n <= MAX_PHRASE_WORDS; n++) {
    for (let i = 0; i + n <= words.length; i++) {
      phrases.add(words.slice(i, i + n).join(""));
    }
  }

  const matches: string[] = [];
  const seen = new Set<string>();

  outer: for (const group of Object.values(knowledgeBase)) {
    for (const [key, answer] of Object.entries(group)) {
      if (seen.has(answer)) continue;

      const exact = phrases.has(key);
      const fuzzy =
        !exact &&
        key.length >= 4 &&
        words.some((w) => w.length >= 4 && editDistance(w, key) <= (key.length >= 8 ? 2 : 1));

      if (exact || fuzzy) {
        matches.push(answer);
        seen.add(answer);
        if (matches.length >= MAX_MATCHES) break outer;
      }
    }
  }

  return matches;
}

export default function FakeAI() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const openChat = () => {
    setOpen(true);
    setMessages((prev) =>
      prev.length === 0
        ? [
            {
              role: "ai",
              content:
                "Quick note: I may not include every detail of Braxton's experience. For full accuracy, please review his project pages alongside using this assistant.",
            },
          ]
        : prev
    );
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const matches = findMatches(input);
    const response = matches.length > 0 ? matches.join("\n\n") : FALLBACK;

    setMessages((prev) => [...prev, { role: "user", content: input }]);

    setTimeout(() => {
      setMessages((prev) => [...prev, { role: "ai", content: response }]);
    }, 300);

    setInput("");
  };

  // Clicking a linked project/cert/skill inside a message navigates there -
  // close the chat first so it doesn't sit on top of the page just loaded.
  const closeOnNavigate = () => setOpen(false);

  return (
    <>
      {/* ================= FLOATING BUBBLE ================= */}
      <AnimatePresence>
        {!open && (
          <motion.button
            key="bubble"
            onClick={openChat}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="
              fixed bottom-6 right-6
              w-14 h-14 rounded-full
              bg-zinc-700 text-white
              font-bold
              shadow-lg shadow-black/40
              hover:bg-zinc-600 transition-colors
              z-50
            "
          >
            AI
          </motion.button>
        )}
      </AnimatePresence>

      {/* ================= CHAT WINDOW ================= */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="chat"
            initial={{ opacity: 0, scale: 0.85, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 24 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            style={{ transformOrigin: "bottom right" }}
            className="
              fixed bottom-6 right-6
              w-80 h-96
              bg-black text-white
              border border-white
              rounded-xl
              flex flex-col
              z-50
              shadow-2xl
            "
          >
            {/* HEADER */}
            <div className="flex justify-between items-center p-3 border-b border-white">
              <h2 className="text-sm font-semibold">
                Portfolio Assistant
              </h2>

              <button
                onClick={() => setOpen(false)}
                className="text-xl font-bold hover:scale-125 transition"
              >
                ✕
              </button>
            </div>

            {/* MESSAGES */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`text-sm p-2 rounded-lg max-w-[85%] whitespace-pre-line ${
                    m.role === "user"
                      ? "ml-auto bg-white text-black"
                      : "mr-auto bg-zinc-800 text-white"
                  }`}
                >
                  {m.role === "ai" ? linkifyMessage(m.content, closeOnNavigate) : m.content}
                </div>
              ))}

              <div ref={chatEndRef} />
            </div>

            {/* INPUT */}
            <div className="p-2 border-t border-white flex gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSend();
                }}
                className="flex-1 p-2 bg-black border border-white text-white rounded"
                placeholder="Ask about skills..."
              />

              <button
                onClick={handleSend}
                className="px-3 border border-white rounded hover:bg-white hover:text-black"
              >
                Send
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
