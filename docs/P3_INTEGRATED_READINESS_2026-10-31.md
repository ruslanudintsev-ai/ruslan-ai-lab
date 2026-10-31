# P3 — integrated four-lab source acceptance and release boundary

**Record date:** 2026-10-31. **State:** ALL FOUR LABS MERGED IN SOURCE; GITHUB PAGES NOT ACTIVATED; HUMAN/RELEASE GATES OPEN. This is not a live-site acceptance certificate.

This report supersedes the *current-state interpretation* of the historical [P1 release-readiness document](./P1_RELEASE_READINESS_2026-10-31.md), but it does **not** rewrite the original P1 specification or retroactively assert that manual device testing was performed. The governing roadmap remains [Projects HQ #33](https://github.com/ruslanudintsev-ai/projects-hq/issues/33).

## Source integration: exact chain of custody

| Milestone | Source evidence | Status |
| --- | --- | --- |
| P0 design/architecture | [PR #1](https://github.com/ruslanudintsev-ai/ruslan-ai-lab/pull/1) | Merged |
| P1 CSS Studio / Opalubka | [PR #2](https://github.com/ruslanudintsev-ai/ruslan-ai-lab/pull/2) | Merged |
| P1 engineering-method section | [PR #3](https://github.com/ruslanudintsev-ai/ruslan-ai-lab/pull/3) | Merged |
| P2 Canvas Lab | [PR #5](https://github.com/ruslanudintsev-ai/ruslan-ai-lab/pull/5) | Merged |
| P2 Workflow Simulator | [PR #7](https://github.com/ruslanudintsev-ai/ruslan-ai-lab/pull/7) | Merged, source-only `cde85d8956e2d97752e8bec74e9e67261614c8e4` |
| P2 3D Playground + conflict reconciliation | [PR #9](https://github.com/ruslanudintsev-ai/ruslan-ai-lab/pull/9) | Merged, source-only `734b7817e1d287913b26e023532837437be8b955` |

The last PR reconciled all overlapping homepage/nav/CSS/build/QA changes **without deleting Workflow or WebGL functionality**. A GitHub Git-commit tree comparison confirmed the merged main SHA `734b7817e1d287913b26e023532837437be8b955` has **identical Git tree SHA `081f6a922bb70acff86d89fb45f8e682d2bf180a`** to the final verified candidate `b18754ed8cd160184c8151973207d7b59151fcbf`. The post-merge documentation commits intentionally change only documentation; do not imply their Git tree remains identical.

## Exact-source automated evidence

**[Final four-lab combined Actions run #41182540844](https://github.com/ruslanudintsev-ai/ruslan-ai-lab/actions/runs/41182540844) — SUCCESS at candidate SHA `b18754ed8cd160184c8151973207d7b59151fcbf`.**

- **30/30 Node unit tests**: deterministic pure CSS/Canvas/Workflow/3D domain behavior.
- **47/47 Chromium Playwright**: the four actual interactive labs, keyboard paths, CI/owner simulated gate, WebGL on-demand initialization and GPU readback, no-JS/static fallbacks, responsive pages, axe WCAG A/AA, no extraneous remote network requests.
- **18/18 Firefox desktop + simulated iPhone WebKit**: browser-specific controls/fallbacks and interaction paths. These are not tests on physical Apple hardware.
- Strict TypeScript / Astro build: **6 actual routes** (home, CSS, Canvas, 3D, Workflow, case study), `404.html`, favicon and nested `/ruslan-ai-lab/` compiled asset path **PASS**. CI read-only; no automatic deployment action.
- **25 Chromium viewport screenshots** across five responsive widths (320/360/390/768/1440), **4 iPhone-like WebKit screenshots**, and an **active WebGL screenshot** archived.
- Local simulated **Lighthouse Mobile Performance 100 / Accessibility 100 / Best Practices 100 / SEO 100**. These are **localhost** results for a compiled artifact, **not** public Lighthouse reports, site uptime or field Core Web Vitals.
- Browser screenshot artifact: [#13034934027](https://github.com/ruslanudintsev-ai/ruslan-ai-lab/actions/runs/41182540844/artifacts/13034934027); local Lighthouse and compiled-site artifacts are linked from the same Actions run. Artifacts expire per GitHub Actions retention settings.

**Manual CI-screenshot review:** exact-head source artifact was downloaded and inspected. A *real visual defect* was found in simulated mobile WebKit: the paused WebGL scene showed a black rectangle even though its status read enabled. The source was fixed to preserve the last rendered WebGL frame; a Firefox/WebKit framebuffer non-black assertion was added. On the final screenshot the shaded cube was visibly rendered instead of black. The new exact-SHA full test suite remained PASS. This is valuable visual evidence, not a substitute for a physical-device acceptance session.

## Manual, human and legal release gates — NOT DONE

- [ ] **Physical iPhone Safari**: record device and iOS/Safari versions; inspect home and four labs, native controls, keyboard/copy fallback, mobile overflow, GPU enable/disable, source links and reduced-motion preference. Keep real evidence.
- [ ] **VoiceOver + Safari**: verify skip link, heading/landmark hierarchy, four lab control labels, status announcements, logical focus, no frame-by-frame announcement spam. Record browser/device.
- [ ] **NVDA + Firefox/Chrome on Windows**: verify same controls, statuses, keyboard navigation and expected focus without mouse.
- [ ] **Independent manual contrast/visual checks**: focus indicator and small text across backgrounds; automated axe and screenshots are not complete screen-reader/manual contrast verification.
- [ ] **Rights/distributed dependencies**: inspect exact browser-shipped JS/CSS and notices against third-party LICENSE/NOTICE, including the 36 previously flagged license expressions in the lockfile. The 447-package metadata audit is **not** a full legal review. See [rights ledger](./RIGHTS_AND_ASSETS.md).
- [ ] **Security & privacy audit**: inspect compiled bundles for third-party requests, secrets, forms, external fonts and unsupported claims of current live AI/infrastructure. CI enforces many of these, but human validation remains separate.
- [ ] **Source/asset link verification at release time**, including Opalubka's dated evidence, and first-party static assets. Historical linked CI results are not live GitHub integration.
- [ ] **Optional product decisions**: Browser APIs extra experiment, dark theme and full RU translation are **not implemented**; keep them explicitly deferred unless owner adds acceptance scope. Competitor positioning research was not independently completed in this source report.

## Publication and rollback — BLOCKED WITHOUT SEPARATE OWNER GO

1. Obtain explicit approval **to publish GitHub Pages**, distinct from source merges or this report.
2. On that GO, inspect actual GitHub Pages permissions/settings, decide the hosted project URL, `base` configuration, canonical/robots/sitemap as appropriate, and a **manual exact-source-SHA compiled-artifact** release workflow. Do not use raw Astro source as a Jekyll website. No such workflow is implemented or enabled now.
3. Preserve the previous published artifact (if any) and document a controlled revert/rollback route. Check Actions security permissions only when configuring authorized deployment.
4. **After publication**, verify real external HTTP/HTTPS, `/ruslan-ai-lab/` navigation, hashed CSS and JS, favicon, static 404, every lab interaction, accessibility, links, mobile responsiveness and deployed source provenance; log real PASS/FAIL. Until then do not mark the site's public availability as working.

**This report documents source QA only. NO GITHUB PAGES DEPLOY / NO DNS / NO BILLING / NO PROFILE EDIT / NO OPALUBKA CHANGES.**

**Task tracking:** [P3 Issue #10](https://github.com/ruslanudintsev-ai/ruslan-ai-lab/issues/10).
