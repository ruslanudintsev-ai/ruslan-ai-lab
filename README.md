# Ruslan AI Lab

**Latest independently HTTP-verified site release: P10 (2026-11-03).** [Ruslan AI Lab](https://ruslanudintsev-ai.github.io/ruslan-ai-lab/) now has **five browser labs, two practical local tools, three engineering case studies and a two-repository public project directory**. The owner-directed [manual GitHub Pages release #41613055918](https://github.com/ruslanudintsev-ai/ruslan-ai-lab/actions/runs/41613055918) completed **Build+Deploy SUCCESS** at exact deployed SHA `08b1b0df28267dd4a6f2a413d7750784bb263b31`. Independent public HTTP checks found both new tool routes and the provenance file at HTTP 200 with the SHA matching. This does **not** establish physical-device accessibility, real user adoption or live-site uptime. Earlier P5 and P6 releases remain historical records; later source-only merges do not automatically publish Pages.

The [recorded P4 live smoke](https://github.com/ruslanudintsev-ai/ruslan-ai-lab/issues/16#issuecomment-6542275339) covers public routes/assets, Browser APIs reorder, explicit browser-only save/restore/clear, and 320/390px layouts. The owner has separately confirmed acceptance. This record is not a claim that the current assistant independently performed physical Safari, VoiceOver, NVDA or third-party license checks.

An original, English-first engineering workbench: small native-web experiments, inspectable source code, verifiable tests and a transparent, AI-assisted approach. The portfolio intentionally has **no remote AI/model API, no sign-up and no visitor tracking**.

## Related project — WF-HUB

- **Live Warface guides:** [wf-hub.ru](https://wf-hub.ru/).
- **Separate private repository:** [ruslanudintsev-ai/wf-hub.ru](https://github.com/ruslanudintsev-ai/wf-hub.ru) (GitHub access required; not a public source listing).
- **This repository:** [ruslan-ai-lab](https://github.com/ruslanudintsev-ai/ruslan-ai-lab), with an independently gated build and release flow.
- **Planned password-gated hostname:** `https://lab.wf-hub.ru/`. Do not call it deployed until authenticated HTTPS and static-route checks pass; the existing GitHub Pages URL is a separate public access path until explicitly disabled.

The projects are **linked, not merged**: separate code, permissions, pipelines, deployments and rollback. The AI Lab footer returns to the public WF-HUB site. A reciprocal *public site* link from WF-HUB must wait for a verified password-protected Lab launch; documentation can link the repositories now. Deployment and security acceptance steps: [WF-HUB integration runbook](docs/WF_HUB_SUBDOMAIN_ROLLOUT.md).


## Two browser-only practical tools (published 2026-11-03)

| Tool | Public route | What it does |
| --- | --- | --- |
| [SEO Inspector](https://ruslanudintsev-ai.github.io/ruslan-ai-lab/tools/seo-inspector/) | `/tools/seo-inspector/` | Inspect pasted HTML or a selected local HTML file for basic on-page SEO signals, with caveats and a copyable report. |
| [Release Inspector](https://ruslanudintsev-ai.github.io/ruslan-ai-lab/tools/release-inspector/) | `/tools/release-inspector/` | Inspect a manually selected static-build folder for missing internal href/src targets, HTML titles, robots/sitemap presence and local sitemap paths; project BASE supported. |

Both tools work locally in the browser without remote analysis, account, API or analytics. They do **not** crawl or test live HTTP deployments. Release Inspector's browser picker is bounded (400 files, 8 MB inspected text and 1 MB per text file). The P9 [release #41611269333](https://github.com/ruslanudintsev-ai/ruslan-ai-lab/actions/runs/41611269333) and P10 [release #41613055918](https://github.com/ruslanudintsev-ai/ruslan-ai-lab/actions/runs/41613055918) have source-verified publication records.

## Reusable CI preflight (P11 source utility)

The repo also contains a **standalone, dependency-free Node.js preflight** for compiled static sites. It is not a remote crawler or a copy of the browser UI. It is intended to find obvious missing build resources *before* deployment:

```bash
node scripts/release-preflight.mjs --dir dist --base /ruslan-ai-lab/
```

To use it in another static site repo, copy `scripts/release-preflight.mjs`, change `--dir` to your built output folder and `--base` to your actual public URL prefix (`/` for most root-domain sites). Run the command **after the build** in GitHub Actions or another CI. Exit code **0** means no missing referenced targets were detected; **1** means missing or invalid local references, and **2** means invalid arguments/input. Findings include exact source file paths; robots.txt, sitemap.xml and duplicated titles are advisories, not forced errors.

**Scope:** It heuristically checks HTML `href`/`src` and built-file existence. It does not fetch URLs, execute frontend JS, process CSS dependencies, apply `<base href>`, model server rewrites or verify HTTP 200s; review its output against your hosting rules. The existing build check dogfoods this script in CI. No changes to paid integrations or the production deployment workflow are needed.

## P6 public project index (published 2026-11-02)

**P6 is now published:** [PR #25](https://github.com/ruslanudintsev-ai/ruslan-ai-lab/pull/25) merged and [manual GitHub Pages release #41423985872](https://github.com/ruslanudintsev-ai/ruslan-ai-lab/actions/runs/41423985872) completed **Build+Deploy SUCCESS** at exact deployed SHA `a8071b36be54416f30b6970ec4a758d8b749f9b4`. The `/projects/` directory lists only two public repositories and is live at [Public projects](https://ruslanudintsev-ai.github.io/ruslan-ai-lab/projects/); its homepage/navigation paths, compiled assets and release-provenance SHA were checked directly over HTTP. The [evidence ledger](docs/P6_PUBLIC_PROJECT_EVIDENCE_2026-10-31.md) and [rights inventory](docs/RIGHTS_AND_ASSETS.md) preserve review limits; the [release/rollback runbook](docs/P6_RELEASE_ROLLBACK_RUNBOOK_2026-11-02.md) is documented but rollback has **not** been exercised. This docs-only update to `main` does **not** represent a new GitHub Pages deploy.

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
- [P5 published engineering case studies](https://github.com/ruslanudintsev-ai/ruslan-ai-lab/issues/18) — completed release and HTTP smoke

P4 [candidate CI #41190268765](https://github.com/ruslanudintsev-ai/ruslan-ai-lab/actions/runs/41190268765) passed **41/41 Node unit, 55/55 Chromium and 22/22 Firefox/simulated-mobile-WebKit tests** at candidate SHA `c93aabc5edfeb19e69735373f3f25734e3d37adf`; local simulated Lighthouse Mobile was **100/100/100/100**. GitHub Pages [run #41192989794](https://github.com/ruslanudintsev-ai/ruslan-ai-lab/actions/runs/41192989794) separately confirms build and publication at merged source SHA `1c13d0d3f965efc2582d38aea63aaedef8834a56`. These are specific GitHub records, **not** uptime, field Core Web Vitals or independent accessibility certification.

## Licensing and privacy

Lab-owned, licensable source is under [MIT](LICENSE). Third-party packages and the separate [Opalubka repository](https://github.com/ruslanudintsev-ai/opalubka) retain their own rights. Development was AI-assisted; do not infer exclusive human authorship, connected background agents, live clients or production performance from this portfolio. System fonts and original SVG/WebGL assets are used; no third-party embedded images, form data capture, remote model APIs, analytics or paid dependencies are required by the labs.

**Release boundary:** The currently published P10 site remains manually gated by the [exact-SHA owner release workflow](.github/workflows/pages-first-release.yml). The P5 published version and its HTTP smoke are recorded in [P5 Issue #18](https://github.com/ruslanudintsev-ai/ruslan-ai-lab/issues/18); historical P4 evidence remains in [Issue #16](https://github.com/ruslanudintsev-ai/ruslan-ai-lab/issues/16). Later source or documentation merges do not auto-publish and must not be called live without a new exact-SHA run. Remaining **independent** physical-device/VoiceOver/NVDA, manual contrast, scoped third-party LICENSE/NOTICE and rollback evidence is tracked in [post-release Issue #15](https://github.com/ruslanudintsev-ai/ruslan-ai-lab/issues/15); do not turn unrecorded independent QA into PASS. No DNS, billing or unrelated repository changes from this README update.
