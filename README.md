# Ruslan AI Lab

**P5 release published and verified (2026-11-02).** The [Ruslan AI Lab site](https://ruslanudintsev-ai.github.io/ruslan-ai-lab/) has five interactive labs and three source-backed case pages. Owner-directed [GitHub Pages Build + Deploy #41422579256](https://github.com/ruslanudintsev-ai/ruslan-ai-lab/actions/runs/41422579256) completed **SUCCESS** on exact deployed SHA `b1f3be88537e0444971b2f4620744fb2f74745c3`; post-release HTTP smoke checked the two new case routes, provenance, homepage, labs, compiled CSS and expected 404s. The earlier accepted P4 release was [#41192989794](https://github.com/ruslanudintsev-ai/ruslan-ai-lab/actions/runs/41192989794) at SHA `1c13d0d3f965efc2582d38aea63aaedef8834a56`. **Later source merges—including the run-metadata correction PR #26—do not automatically deploy.**

The [recorded P4 live smoke](https://github.com/ruslanudintsev-ai/ruslan-ai-lab/issues/16#issuecomment-6542275339) covers public routes/assets, Browser APIs reorder, explicit browser-only save/restore/clear, and 320/390px layouts. The owner has separately confirmed acceptance. This record is not a claim that the current assistant independently performed physical Safari, VoiceOver, NVDA or third-party license checks.

An original, English-first engineering workbench: small native-web experiments, inspectable source code, verifiable tests and a transparent, AI-assisted approach. The portfolio intentionally has **no remote AI/model API, no sign-up and no visitor tracking**.


## P6 public project index (candidate only)

The **[P6 Draft source change](https://github.com/ruslanudintsev-ai/ruslan-ai-lab/issues/22)** adds a `/projects/` directory of two **public** evidence-backed repositories. This route is a **source-only proposal** and is not part of the last verified Pages release; successful candidate CI or a branch commit is not proof of live publication. No private project source, internal metrics, unverified deployments or new contact/tracking systems are included. Evidence ledger: [P6 source review](docs/P6_PUBLIC_PROJECT_EVIDENCE_2026-10-31.md). Historical rights inventory reconciled to the latest lab and case status in [rights and assets](docs/RIGHTS_AND_ASSETS.md); the reviewed, **unexecuted** [exact-SHA release/rollback runbook](docs/P6_RELEASE_ROLLBACK_RUNBOOK_2026-11-02.md) documents how to verify each publication and respond to a bad release.

## Five browser-native labs

| Lab | Route | What is implemented |
| --- | --- | --- |
| **CSS Studio** | `/labs/css-studio/` | Change bounded colors, border radius, grid columns/gap and motion; inspect preview and deterministic generated CSS; Reset/Copy with truthful clipboard fallback |
| **Canvas Lab** | `/labs/canvas/` | Deterministic seeded particles with bounded count, local Canvas2D, Play/Pause/Reset, reduced-motion and background-tab handling; static SVG fallback |
| **3D Playground** | `/labs/3d/` | **Explicit opt-in** original WebGL1 cube, material/light/camera settings, Play/Pause/Reset, 30-FPS draw budget, DPR cap and WebGL-unavailable/context-loss fallback. No GPU initialization before user action |
| **AI Workflow Simulator** | `/labs/workflow/` | A strictly **local, simulated** Issue → agent draft → PR → CI pass/fail → owner review → release-decision walkthrough, with a rework loop and explicit owner approval gate. **No real AI model, GitHub connection or deployment occurs** |
| **Browser APIs Lab** | `/labs/browser-apis/` | Keyboard/touch-friendly move controls plus optional pointer drag, explicit opt-in localStorage Save, restore across reload, separate Clear/Reset and honest storage-blocked/no-JS fallbacks |

The homepage also includes an evidence-backed **How the work gets verified** section; `/case-studies/opalubka/` describes an independent public repository, using real historical GitHub source/PR/Actions links. The actual Opalubka repository was not changed by this project.

**Not implemented:** full Russian translation, user-selected dark mode or a backend. These are optional product decisions, not missing or falsely advertised live labs.

## Build and test locally

Requires **Node.js 24** and npm:

```bash
npm ci
npm run check
npm test
npm run dev
```

To validate a local static build with the deployed GitHub Pages project prefix:

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
- [P4 published browser lab & live smoke](https://github.com/ruslanudintsev-ai/ruslan-ai-lab/issues/16) — completed
- [Independent post-release evidence checklist](https://github.com/ruslanudintsev-ai/ruslan-ai-lab/issues/15) — physical device/AT, third-party notices and rollback records
- [P5 portfolio evidence and positioning plan](https://github.com/ruslanudintsev-ai/ruslan-ai-lab/issues/18) — proposed next product/value phase

P4 [candidate CI #41190268765](https://github.com/ruslanudintsev-ai/ruslan-ai-lab/actions/runs/41190268765) passed **41/41 Node unit, 55/55 Chromium and 22/22 Firefox/simulated-mobile-WebKit tests** at candidate SHA `c93aabc5edfeb19e69735373f3f25734e3d37adf`; local simulated Lighthouse Mobile was **100/100/100/100**. GitHub Pages [run #41192989794](https://github.com/ruslanudintsev-ai/ruslan-ai-lab/actions/runs/41192989794) separately confirms build and publication at merged source SHA `1c13d0d3f965efc2582d38aea63aaedef8834a56`. These are specific GitHub records, **not** uptime, field Core Web Vitals or independent accessibility certification.

## Licensing and privacy

Lab-owned, licensable source is under [MIT](LICENSE). Third-party packages and the separate [Opalubka repository](https://github.com/ruslanudintsev-ai/opalubka) retain their own rights. Development was AI-assisted; do not infer exclusive human authorship, connected background agents, live clients or production performance from this portfolio. System fonts and original SVG/WebGL assets are used; no third-party embedded images, form data capture, remote model APIs, analytics or paid dependencies are required by the labs.

**Release boundary:** GitHub Pages is **published**, but remains **manually** gated by the [exact-SHA owner release workflow](.github/workflows/pages-first-release.yml). The P5 published version and its HTTP smoke are recorded in [P5 Issue #18](https://github.com/ruslanudintsev-ai/ruslan-ai-lab/issues/18); historical P4 evidence remains in [Issue #16](https://github.com/ruslanudintsev-ai/ruslan-ai-lab/issues/16). Later source or documentation merges do not auto-publish and must not be called live without a new exact-SHA run. Remaining **independent** physical-device/VoiceOver/NVDA, manual contrast, scoped third-party LICENSE/NOTICE and rollback evidence is tracked in [post-release Issue #15](https://github.com/ruslanudintsev-ai/ruslan-ai-lab/issues/15); do not turn unrecorded independent QA into PASS. No DNS, billing or unrelated repository changes from this README update.
