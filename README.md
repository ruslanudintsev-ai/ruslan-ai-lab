# Ruslan AI Lab

**P4 candidate (source-only, Draft [PR #17](https://github.com/ruslanudintsev-ai/ruslan-ai-lab/pull/17)):** a fifth Browser APIs Lab is being reviewed in a separate branch. Reordering works through keyboard/touch-friendly buttons or pointer drag; localStorage persistence happens **only** after an explicit Save. This new lab is **NOT part of the first published Pages SHA** until separately approved, merged, tested and dispatched. The statements below describe the current public first release, not an already-live fifth lab.

**Status (2026-10-31): four working labs in `main`; first GitHub Pages deployment SUCCESS according to [Actions #41188192743](https://github.com/ruslanudintsev-ai/ruslan-ai-lab/actions/runs/41188192743), attempt 2, from exact source SHA `75b5d2e224acad07de76db3c6cbbb12f26f060e5`.** GitHub reports the environment URL [Ruslan AI Lab](https://ruslanudintsev-ai.github.io/ruslan-ai-lab/). External live HTTP/asset checks, physical iPhone and manual accessibility QA are **not independently verified**; do not present these as PASS.

An original, English-first engineering workbench: small browser-native experiments, inspectable code, verifiable tests and a transparent account of how the owner and AI-assisted tools collaborate. A first static site has been deployed via the separately approved Pages workflow; **live browser/assistive-technology acceptance remains open**.

## Four browser-native labs

| Lab | Route | What is implemented |
| --- | --- | --- |
| **CSS Studio** | `/labs/css-studio/` | Change bounded colors, border radius, grid columns/gap and motion; inspect preview and deterministic generated CSS; Reset/Copy with truthful clipboard fallback |
| **Canvas Lab** | `/labs/canvas/` | Deterministic seeded particles with bounded count, local Canvas2D, Play/Pause/Reset, reduced-motion and background-tab handling; static SVG fallback |
| **3D Playground** | `/labs/3d/` | **Explicit opt-in** original WebGL1 cube, material/light/camera settings, Play/Pause/Reset, 30-FPS draw budget, DPR cap and WebGL-unavailable/context-loss fallback. No GPU initialization before user action |
| **AI Workflow Simulator** | `/labs/workflow/` | A strictly **local, simulated** Issue → agent draft → PR → CI pass/fail → owner review → release-decision walkthrough, with a rework loop and explicit owner approval gate. **No real AI model, GitHub connection or deployment occurs** |

The homepage also includes an evidence-backed **How the work gets verified** section; `/case-studies/opalubka/` describes an independent public repository, using real historical GitHub source/PR/Actions links. The actual Opalubka repository was not changed by this project.

**Not implemented:** an additional Browser APIs lab, a Russian translation, user-selected dark mode or a backend. These are elective follow-ons, not fake live demos or automatically included release requirements.

## Build and test locally

Requires **Node.js 24** and npm:

```bash
npm ci
npm run check
npm test
npm run dev
```

To validate a local static build with the prospective GitHub Pages project prefix:

```bash
DEMO_BASE_PATH=/ruslan-ai-lab/ npm run build
DEMO_BASE_PATH=/ruslan-ai-lab/ node scripts/check-build.mjs
```

`npm run test:e2e` requires Playwright browsers and a locally served built site. The read-only [GitHub Actions QA workflow](.github/workflows/p1-candidate-quality.yml) handles this, exercising Chromium, Firefox, simulated mobile WebKit, keyboard/axe, no-JavaScript fallbacks, responsive widths, screenshot archives, lockfile license metadata, and a **localhost** Lighthouse Mobile benchmark. **It never deploys Pages.**

## Source-backed acceptance

- [Original P0 design](docs/P0_DESIGN_BRIEF.md) — **B / Precision Editorial Workbench**, Astro with native controls
- [Original P1 acceptance scope](docs/P1_MVP_ACCEPTANCE.md) — historical checklist, written before implementation
- [P1 initial readiness](docs/P1_RELEASE_READINESS_2026-10-31.md) — historical baseline and pending manual gates
- [P3 integrated readiness](docs/P3_INTEGRATED_READINESS_2026-10-31.md) — evidence, exact source tree, outstanding gates and release boundary
- [Rights and assets ledger](docs/RIGHTS_AND_ASSETS.md) — original visuals, shaders, external package rights
- [P3 unresolved checklist](https://github.com/ruslanudintsev-ai/ruslan-ai-lab/issues/10)

The four-lab integrated candidate [Actions #41182540844](https://github.com/ruslanudintsev-ai/ruslan-ai-lab/actions/runs/41182540844) passed **30 unit, 47 Chromium and 18 Firefox/mobile WebKit tests**, with raw local Lighthouse Mobile **100/100/100/100**. Its verified source was squash-merged as [PR #9](https://github.com/ruslanudintsev-ai/ruslan-ai-lab/pull/9); merge and candidate **Git tree hashes match**. These are CI and screenshot results **only**, not field Core Web Vitals, physical iPhone QA or proof of complete screen-reader usability.

## Licensing and privacy

Lab-owned, licensable source is under [MIT](LICENSE). Third-party packages and the separate [Opalubka repository](https://github.com/ruslanudintsev-ai/opalubka) retain their own rights. Development was AI-assisted; do not infer exclusive human authorship, connected background agents, live clients or production performance from this portfolio. System fonts and original SVG/WebGL assets are used; no third-party embedded images, form data capture, remote model APIs, analytics or paid dependencies are required by the labs.

**Release boundary:** the owner separately authorized the first Pages publication on 2026-10-31. Its exact-SHA release job succeeded in [Actions #41188192743](https://github.com/ruslanudintsev-ai/ruslan-ai-lab/actions/runs/41188192743); the [owner-gated release workflow](.github/workflows/pages-first-release.yml) uses explicit dispatch for future source changes, not automatic application-code pushes. **Physical iPhone/VoiceOver/NVDA, manual contrast, third-party notice review, external live HTTP/asset/interaction QA and rollback acceptance are still open** in [Issue #10](https://github.com/ruslanudintsev-ai/ruslan-ai-lab/issues/10). No billing, DNS, profile or Opalubka changes were authorized.
