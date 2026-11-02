# Ruslan AI Lab — rights, provenance and asset inventory

**Original inventory:** 2026-10-31 (four-lab source snapshot). **Current release status checked:** 2026-11-02. This file retains the historical four-lab review and adds a dated status reconciliation; it is **not** an independent legal clearance or claim of exclusive human authorship.

## Current status and changed scope (2026-11-02)

- **P4 IS published:** Five native-browser labs were deployed by [manual Pages run #41192989794](https://github.com/ruslanudintsev-ai/ruslan-ai-lab/actions/runs/41192989794) at exact release source SHA `1c13d0d3f965efc2582d38aea63aaedef8834a56`. A dated [public smoke record](https://github.com/ruslanudintsev-ai/ruslan-ai-lab/issues/16#issuecomment-6542275339) exists. Browser smoke is **not** VoiceOver/NVDA, physical-device or legal redistribution certification.
- **P4 Browser APIs Lab** now exists at `src/domain/browser-apis.ts`, `src/scripts/browser-apis.ts`, `src/components/BrowserApisLab.astro`, `src/pages/labs/browser-apis/index.astro`: local-only ordered cards, explicit opt-in browser storage, no backend or remote AI API.
- **P5 IS published:** public original-source case pages `src/pages/case-studies/webkit-frame/index.astro` and `src/pages/case-studies/release-gates/index.astro` were published in [manual Pages run #41422579256](https://github.com/ruslanudintsev-ai/ruslan-ai-lab/actions/runs/41422579256) at exact source SHA `b1f3be88537e0444971b2f4620744fb2f74745c3`; independently checked HTTP 200 and page content, provenance and bundled CSS. Subsequent source-only PR #26 merge at `63ad5dfc1438ac6130818f314035ce262f369443` is **not** itself a new Pages deploy.
- **P6 IS published (2026-11-02):** original `/projects/` directory at `src/pages/projects/index.astro` lists only the public `ruslan-ai-lab` and educational `opalubka` repositories, without importing or relicensing either repository's source. [PR #25](https://github.com/ruslanudintsev-ai/ruslan-ai-lab/pull/25) merged and [manual Pages run #41423985872](https://github.com/ruslanudintsev-ai/ruslan-ai-lab/actions/runs/41423985872) **SUCCESS** at deployed SHA `a8071b36be54416f30b6970ec4a758d8b749f9b4`; HTTP evidence confirms the public `/projects/` page 200 and its release provenance. This is not a statement of third-party legal clearance, completed rollback drill, or production business impact.
- **Latest P6 license metadata inventory** in [Actions #41214597247](https://github.com/ruslanudintsev-ai/ruslan-ai-lab/actions/runs/41214597247): **447 lockfile entries, 0 missing license/version, 0 manifest mismatches**, with **36 entries flagged for manual review**. Compiled candidate inventory found **18 shipped static files, 11 HTML pages and zero static asset policy errors**. **Neither test provides independent legal clearance or proves which third-party licenses obligate a public NOTICE**.
- **Manual post-release verification remains open:** [Issue #15](https://github.com/ruslanudintsev-ai/ruslan-ai-lab/issues/15) covers screen reader, physical device, manual contrast, redistribution notices, external live HTTP and rollback evidence. The first four-lab inventory below must not be mistaken for the complete latest source inventory.

### Historical four-lab inventory (retained for traceability)

| Category | Actual project paths | Provenance and licensing boundary |
| --- | --- | --- |
| Identity and original static artwork | `public/favicon.svg`, `src/pages/index.astro`, `src/styles/global.css` | Original geometric project art, editorial layout, grid/diagrams; **no remote images, custom downloadable fonts or stock imagery** |
| CSS Studio | `src/domain/studio.ts`, `src/scripts/studio.ts`, `src/components/Studio.astro` | New AI-assisted bounded CSS editor and deterministic preview/code generation, local to this repository |
| Canvas Lab | `src/domain/canvas.ts`, `src/scripts/canvas.ts`, `src/components/CanvasLab.astro` | New pure seeded physics and original small in-repo static SVG particle illustration; Canvas2D only, no external textures or plugins |
| 3D Playground | `src/domain/playground3d.ts`, `src/scripts/playground3d.ts`, `src/scripts/webgl-scene.ts`, `src/components/ThreeDPlayground.astro` | **Original in-repository WebGL1 geometry, vertex/fragment shader code and SVG cube fallback**; no downloaded 3D model, Three.js, Unity runtime or remote texture |
| AI Workflow Simulator | `src/domain/workflow.ts`, `src/scripts/workflow.ts`, `src/components/WorkflowSimulator.astro` | New local state machine and semantic stepper; actual source/CI links are **historical evidence**, not live API/AI requests |
| Case study | `src/pages/case-studies/opalubka/index.astro` | Original narrative referring to separate, public Opalubka repo and specific PR/Actions. **No Opalubka source/media was copied or relicensed** |
| Built output and build-time tooling | Astro, TypeScript, Playwright, axe-core, Lighthouse and transitive npm packages | Third-party code/licenses remain with their owners; lockfile contains development/testing dependencies **not necessarily shipped** in compiled `dist/`. Check redistributed code and notices separately |
| Typefaces, video, audio, tracker integrations | System font stack; **no embedded video/audio or remote fonts** | No third-party paid subscription, tracking, credential, contact form or browser network service is introduced by the four labs |

## Repository-level license and AI provenance

The standalone project's root [MIT License](../LICENSE), Copyright (c) 2026 Ruslan Udintsev, covers **only rights the licensor can grant** in the lab's own source and documentation. The project has used AI assistance for implementation and documentation; this ledger is not a claim that one human authored every byte or that all AI-assisted content carries exclusive copyright. The license does **not** supersede npm-package licenses, nor any copyright in independent Opalubka source, other repositories, fonts, or external assets.

## Dependency license inventory — NOT independent legal review

`scripts/audit-licenses.mjs` checks pinned dependencies, manifest/lockfile version and license **metadata** and writes `quality-results/licenses-report.json`; the read-only CI archives results for the exact source SHA. The project has **447 locked package entries** (including build, test and optional platform packages), with no empty license metadata in the last verified inventory.

A **36-entry notice review queue** was identified by expressions mentioning LGPL, MPL, FSL or BlueOak. Examples include `@img/sharp-libvips-*` platform variants, `lightningcss*`, `axe-core`, `sentry` and `glob`. These are flags for human inspection, **not** established legal incompatibility or proof that such packages are distributed in the browser.

Before authorized publication:

- [ ] Compare the **exact final** compiled `dist/` JS/CSS/HTML and any redistributed assets against applicable LICENSE/NOTICE terms.
- [ ] Check package licenses/notices that actually apply to redistribution; distinguish local build/test tooling and optional platform packages from browser-shipped code.
- [ ] Inspect client bundles for embedded secrets, unexpected remote requests, user tracking, copied models/media, and references that misrepresent working AI/CI integrations.
- [ ] Record any third-party asset and rights review if new media or code is introduced after this inventory.
- [ ] Keep the P3 manual device/assistive-tech gates separately tracked at [Issue #10](https://github.com/ruslanudintsev-ai/ruslan-ai-lab/issues/10).

**Provenance:** [source merge PR #7](https://github.com/ruslanudintsev-ai/ruslan-ai-lab/pull/7), [source merge PR #9](https://github.com/ruslanudintsev-ai/ruslan-ai-lab/pull/9), [four-lab CI run #41182540844](https://github.com/ruslanudintsev-ai/ruslan-ai-lab/actions/runs/41182540844). Code may be open and QA-approved without any public hosted release.

**Historical four-lab marker (2026-10-31):** `MIT_FOR_LAB_OWN_SOURCE / THIRD_PARTY_RIGHTS_PRESERVED / NO_DEPLOY / NO_BILLING / NO_OPALUBKA_CHANGES` **at the time of that original source-only review.** It is not the current P4 Pages status.
