# Ruslan AI Lab

**Status:** working **P1 MVP source implementation and QA-approved release candidate**. **GitHub Pages is not published**; a passing CI does not make this a live website. A distinct engineering portfolio for interactive, inspectable experiments and verifiable AI-assisted work.

The first implemented experiment is **CSS Studio**: bounded accent/radius/column/gap/motion controls update a local preview and deterministic, selectable CSS. Reset and copy-with-fallback work without a backend. The homepage and case study are rendered as static Astro pages. Canvas/3D/workflow demos are **planned, not available**.

## Technical approach

- **Astro 7 + strict TypeScript**, static output and a tiny progressive-enhancement browser script.
- Native accessible controls, keyboard focus and reduced-motion fallback; no React, WebGL, remote scripts, trackers, forms, or personal-data collection.
- **English first**; the RU translation is a later content milestone, not a nonworking language toggle.
- Built-in pages: `/`, `/labs/css-studio/`, `/case-studies/opalubka/`, `/404.html`.
- Planned GitHub Pages project prefix: `/ruslan-ai-lab/` (a locally tested **fixture**, not proof of a real deployed URL).

## Reproduce the candidate locally

Requires **Node.js 24** and npm.

```bash
npm ci
npm run check
npm test
npm run dev
```

To build/test the project subpath rather than root:

```bash
DEMO_BASE_PATH=/ruslan-ai-lab/ npm run build
DEMO_BASE_PATH=/ruslan-ai-lab/ node scripts/check-build.mjs
```

The read-only GitHub Actions quality workflow compiles the project under `/ruslan-ai-lab/`, serves it on localhost, runs real Playwright and axe tests, and archives exact-SHA static and screenshot evidence (Astro may inline very small, local client scripts instead of emitting a separate JS file). It **does not publish** GitHub Pages. CI results are evidence for the particular run, not guarantees of current live uptime, accessibility, or field speed.

## Source and documentation

- [Design P0](docs/P0_DESIGN_BRIEF.md): selected **B — Precision Editorial Workbench**, original responsive wireframes
- [Architecture ADR](docs/P0_ARCHITECTURE_ADR.md): Astro, strict TypeScript, safe deterministic CSS, evidence boundaries
- [MVP acceptance](docs/P1_MVP_ACCEPTANCE.md): manual and automated gates
- [Rights/assets provenance](docs/RIGHTS_AND_ASSETS.md): local original design assets and third-party exclusions
- [P1 release readiness](docs/P1_RELEASE_READINESS_2026-10-31.md): exact-SHA QA baseline, manual-device checks, dependency metadata audit and owner-only release gates
- [Opalubka](https://github.com/ruslanudintsev-ai/opalubka): **separate repository**, used only as a sourced case study and never modified by this project

**Ownership and AI attribution:** the owner specifies goals/constraints and reviews release decisions; AI-assisted tools may generate implementation code and documentation. Do not claim exclusive authorship of all code or simulate live integrations. The owner's original source in this separate repository is distributed under the [MIT License](LICENSE), to the extent of rights the owner can license. Third-party dependencies remain under their respective licenses, and the independent Opalubka project is not relicensed. This is an AI-assisted source project, not a representation of exclusive human authorship of every element.

**Release gate:** automated P1 tests run on the exact candidate SHA, and any merge to `main` remains distinct from publication. **NO GITHUB PAGES DEPLOY / NO DNS / NO PAID SERVICES / NO OPALUBKA CHANGES** without separate approval.
