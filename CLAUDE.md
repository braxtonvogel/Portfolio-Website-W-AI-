# CLAUDE.md — Portfolio-Website-W-AI-

Braxton Vogel's personal portfolio: a Next.js App Router site with a scroll-driven "dive" home page,
project case-study pages, and certification pages. Deployed on Vercel from `main`.

## Stack
Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS 4, CSS Modules, framer-motion, three.js. Versions: `package.json`.

## Commands
- Install: `npm ci`
- Dev: `npm run dev` · Build: `npm run build` · Serve build: `npx next start -p 3123`
- Lint: `npm run lint` (ESLint 9, `eslint.config.mjs`) · Types: `npx tsc --noEmit`
- Tests: none yet (no test runner in `package.json`).

## Folder map
- `app/` routes: `page.tsx` (home), `projects/<slug>/`, `certifications/`, `early-development/`
- `components/` shared UI; `components/dive/` the home-page dive (sections, 3D backdrop, overlay)
- `lib/` content and data (`portfolioData.ts`, `growthNotes.ts`, `certifications.ts`, `siteNav.ts`)
- `public/` images and PDFs · Import alias `@/*` = repo root

## Conventions
- Page content lives in `lib/*.ts`; components render it. Change copy there, not in JSX.
- Page-specific styles go in a co-located `*.module.css`; Tailwind for layout and one-offs.
- Render user-visible text as plain text nodes (no `dangerouslySetInnerHTML`).
- Design comes from FRIDAY's specs; build to them, don't redesign. Keep diffs to the files the task names.

## Definition of done
- `npm run lint` (0 errors), `npx tsc --noEmit` and `npm run build` pass; the Vercel check on the PR is green.
- No secrets, tokens, keys, or personal/school data in code, commits, or PR text. No logs or screenshots in PRs.
- Security headers: none in `next.config.ts` yet. Never weaken them once added; adding them is its own PR.
- New logic gets a test once a runner exists; until then, say in the summary exactly what you verified by hand.
- Never use `--no-verify` or force-push.

## Known traps
- Tailwind's base styles set a site-wide `line-height: 1.5`; mockups assume `normal`, so spacing drifts 2–5px. Override per element.
- `html { scroll-behavior: smooth }` has no reduced-motion guard; scripted captures must scroll with `behavior: 'instant'`.
- 3D flips (`app/projects/octopus-azure/`): keep `backface-visibility: hidden`, the perspective, and the fade values; big rotations balloon past the viewport.
- `whileInView` fade-ins stay at opacity 0 until scrolled into view; check sections in the viewport, not from a fast scroll.
- Don't change PDF-backed cards in `lib/growthNotes.ts` / `components/dive/sectionContent.tsx` when editing preview cards.
- Facts drift: the stack, platform, and certs must match across `lib/*.ts`, project pages, and the resume and cover-letter PDFs. When changing one, grep for the others and flag mismatches; don't silently pick one.
- Images in `public/` were oversized; keep new images compressed and sized for display.

## End-of-run summary (required)
1. Goal, one line. 2. Files changed with a one-line why each. 3. Commands run and results.
4. What you could not verify. 5. Open questions or risks.
