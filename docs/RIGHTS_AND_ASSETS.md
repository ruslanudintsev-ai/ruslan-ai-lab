# Ruslan AI Lab — rights, provenance and asset inventory

**Review date:** 2026-10-31. **Scope:** source-integrated portfolio with four actual browser labs; not yet published. This is a factual provenance/notice review queue, **not** an independent legal clearance or guarantee of exclusive human authorship.

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

**MIT_FOR_LAB_OWN_SOURCE / THIRD_PARTY_RIGHTS_PRESERVED / NO_DEPLOY / NO_BILLING / NO_OPALUBKA_CHANGES.**
