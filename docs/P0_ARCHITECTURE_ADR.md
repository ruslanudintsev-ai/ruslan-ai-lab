# ADR-0001 — architecture for Ruslan AI Lab

**Status:** PROPOSED; P0 documentation only, no build/deployment.
**Date:** 2026-10-30. Related: [P0 design brief](./P0_DESIGN_BRIEF.md), [P1 contract](./P1_MVP_ACCEPTANCE.md), [portfolio roadmap](https://github.com/ruslanudintsev-ai/projects-hq/issues/33).

## Decision and rationale

Use **Astro static output + strict TypeScript + semantic HTML + modern CSS**. The homepage and case studies render as static HTML; the first working CSS Studio is a **small, progressive-enhancement vanilla TypeScript module**. No React, server, database, authentication, external AI API or analytics dependency for P1. Add framework islands only when there is a measurable benefit. Zero-dollar infrastructure target.

Rationale: fast initial render, transparent source tree, browser-native interactivity, accessible controls and minimal JavaScript. Astro alone does not guarantee good Core Web Vitals, accessibility or search ranking: verify built pages and real browser outcomes.

## Scope / non-goals

P0: ADR, design and acceptance definitions only; no project scaffolding on `main`, no deployment. P1 candidate only after owner style/scope approval. P2 may add Canvas, 3D and pipeline simulator in separately reviewed slices. Never borrow the Opalubka codebase wholesale, mutate its repo, invent online AI agents, or put any keys into frontend output.

### Proposed routes

| Route | Output | Purpose |
| --- | --- | --- |
| `/` | static + optional tiny interactive preview | positioning; links to working lab and evidence |
| `/labs/css-studio/` | static shell + progressive TS enhancement | one real experiment with source/docs/tests |
| `/case-studies/opalubka/` | static content | real separately sourced engineering case |
| `/404.html` | static | respectful not-found state |
| `/ru/...` | **later** | bilingual phase after English source is reviewed |
| `/labs/{canvas,3d,workflow}/` | **P2 later** | not included as fake live routes |

Use site-root-relative paths via Astro `import.meta.env.BASE_URL` or a tested helper; do not hardcode `/` for assets if project may eventually live at `/ruslan-ai-lab/`. At P0, Pages source and canonical URL are intentionally undecided; future release requires a separate approved SHA and real host checks.

### Candidate file layout (to implement only in P1)

```text
src/
  pages/
    index.astro
    labs/css-studio/index.astro
    case-studies/opalubka/index.astro
  layouts/
    SiteLayout.astro
  components/
    SiteHeader.astro
    SiteFooter.astro
    Hero.astro
    LabStatusCard.astro
    CaseEvidence.astro
    CSSStudio.astro
  styles/
    tokens.css
    global.css
  content/
    cases/opalubka.ts
    experiments.ts
  scripts/
    css-studio.ts
  domain/
    css-studio.ts
tests/
  unit/css-studio.test.ts
  browser/home.spec.ts
  browser/css-studio.spec.ts
  browser/case-study.spec.ts
docs/
  P0_DESIGN_BRIEF.md
  P0_ARCHITECTURE_ADR.md
  P1_MVP_ACCEPTANCE.md
  RIGHTS_AND_ASSETS.md            # add for implementation
.github/workflows/
  quality.yml                     # read-only, no deployment
```

Avoid magic JSON schemas for P1; typed TS objects are sufficient. Case study fact records must include source URL, source SHA or run link, evidence date, limitations and owner-vs-AI attribution. An actual static site must not imply its case data is fetched live.

## CSS Studio domain contract

A pure `createCssTokens(state)` function maps a small, **bounded typed state** to generated CSS, independent of the DOM; it is unit-testable. State example:

```ts
type StudioState = {
  accent: '#146B67' | '#8054B2' | '#B44C38';
  radiusPx: 0 | 8 | 16 | 24;
  columns: 1 | 2 | 3;
  gapPx: 8 | 16 | 24 | 32;
  motion: 'none' | 'subtle';
};
```

P1 implementation may refine this type but must preserve finite/safe options, deterministic generation and straightforward tests. Controls are native `<select>`, `<input type="range">` with labels and a real copy button. Display a single preview card/grid with live computed CSS; provide **Reset** and a selectable/copyable CSS snippet. Copy to clipboard only via direct user gesture; when Clipboard API is unavailable/denied, preserve selectable text with clear keyboard fallback. Announce updates/copy success in non-intrusive `aria-live="polite"`.

**Safety:** render snippet as text via `textContent`, not `innerHTML`; CSS values are whitelisted, not raw user-supplied CSS. No request to remote font/media servers; no contact/secret entry. Respect `prefers-reduced-motion` even if motion token is `subtle`. Local storage is optional and **off by default**; P1 does not need cookie banners or data collection.

## Accessibility, privacy, performance

- Document language/title/description, skip link, one H1 per page, meaningful section headers, visible keyboard focus, native labels, semantic links/buttons, reachable full interaction at 320px.
- Contrast targets: WCAG AA 4.5:1 for normal text and 3:1 for large text (verify with actual analyzer); controls/pointer targets aim ≥44×44 CSS px where practical; do not rely on color alone.
- Motion fallback: CSS and scripts respect `prefers-reduced-motion`, no autoplay, no flashing/glowing "agent consoles".
- Performance budget **targets, not measured facts**: homepage client JS under 60 kB transferred (gzip) if practical, no WebGL or remote dependencies on initial load, under 150 kB of custom image/media transfer. Document exceptions and benchmark after build; lab Lighthouse mobile Performance ≥90 is an acceptance target, never a promised field result.
- Privacy: no forms collecting PII, no tracking SDK, no remote scripts, no live analytics or cookies by default. External links to GitHub are normal opt-in navigation, with clear destinations.
- Original SVG/CSS/diagrams only until rights ledger explicitly lists a third-party asset and its license. MIT license for our own source to be separately owner-approved; do not copy Opalubka MIT notice without checking attribution and user decision.
- Document security limitations honestly: frontend sandbox isn't a secret boundary; any shipped client TS code is public. No user-provided HTML, JS or CSS execution; avoid rendering arbitrary GitHub comments as HTML.

## Case-study data provenance

Opalubka is a **linked independent project**, not a submodule. Anchor facts to its actual GitHub:
- Repo: https://github.com/ruslanudintsev-ai/opalubka
- Example reproducible source + tests: [merged integration PR #6](https://github.com/ruslanudintsev-ai/opalubka/pull/6)
- Example build + deploy record (source, not live/browser proof): [Actions run #41100450242](https://github.com/ruslanudintsev-ai/opalubka/actions/runs/41100450242)
- Never treat a passing GitHub Actions workflow as verified permanent uptime, field LCP or present-day HTTP health. When describing a live result, capture actual run, timestamp and URL separately.
- Credit AI-assisted implementation accurately: owner set goals/constraints, reviewed and authorized merges/releases; tooling did much of the code. Do not claim the owner personally wrote all modules.

## Build and release gates (future, not active)

1. P1 implementation stays on **Draft PR**, not `main`: dependency lockfile committed; `astro check`; deterministic unit suite; real Playwright Chromium mobile/desktop plus at least one additional browser where available; axe automated accessibility; keyboard and reduced-motion audits; screenshots 320/360/390/768/1440.
2. Exact SHA CI artifact must contain static HTML, prefixed assets, no source maps with secrets, licenses/provenance, stable generated CSS and no fake routes. All four working routes/links should be tested.
3. After independent review, owner separately approves **source merge**. Publishing requires **another GO** and a manual Pages workflow that deploys compiled output only. Do not set `push` to automatically publish in P1.
4. Verify real public URL, bundle CSS/JS/favicon responses, no browser errors, links, DNS/HTTPS as applicable, source SHA/provenance, 320–1440 behavior, and keep rollback procedure.

## Options considered

- **React/Next-first:** rejected for MVP: client/runtime overhead with no demonstrated component complexity benefit. Reconsider only when working interactions demand it.
- **Pure HTML/JS without Astro:** could work, but harder to scale consistent pages/case studies as the lab grows. Astro wins for content site + interactive island.
- **3D-first hero:** rejected for first value: adds failure/performance/accessibility risk while not demonstrating engineering evidence.
- **Live GitHub/AI API dashboard:** deferred: current MVP can show a clearly labeled static workflow simulation backed by real source links. No secrets and no visitor-auth flows.

## Open decisions before code

- Visual theme A or B (B recommended).
- English-first with RU milestone, or bilingual from MVP day one (English-first recommended for quality and time).
- Owner-approved MIT notice for **this** repo, or keep licensing undecided until original assets and code inventory.
- Whether homepage embeds an interactive mini CSS preview or links to the complete tool; recommend full tool on its own route, homepage static teaser.

**Record:** PROPOSED; nothing described here has been implemented or published.
