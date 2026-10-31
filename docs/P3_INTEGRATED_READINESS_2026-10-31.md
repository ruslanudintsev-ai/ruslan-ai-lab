# P3 — integrated four-lab source acceptance and release boundary

**Record date:** 2026-10-31. **Updated after first Pages release:** ALL FOUR LABS MERGED; GitHub Actions reports successful Pages deployment at exact source SHA `75b5d2e224acad07de76db3c6cbbb12f26f060e5` ([run #41188192743, second attempt](https://github.com/ruslanudintsev-ai/ruslan-ai-lab/actions/runs/41188192743)). Physical-device, assistive-technology, legal-notice and independent external live HTTP/asset QA remain open. This is **not** a live-site acceptance certificate.

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

## First GitHub Pages release — GitHub deploy SUCCESS; independent live QA OPEN

1. **Owner authorization recorded:** owner explicitly permitted first publication before the outstanding physical-device/assistive-technology review. This does **not** mark those checks PASS.
2. **Released source:** `main@75b5d2e224acad07de76db3c6cbbb12f26f060e5`. [First release workflow](../.github/workflows/pages-first-release.yml) builds compiled `dist/` under `/ruslan-ai-lab/` with locked dependencies, unit/type checks, asset audit, MIT license and SHA provenance. It does not publish raw Astro/Jekyll sources. Future application commits do **not** trigger automatic Pages deployments; an explicit Actions dispatch is required.
3. **Exact GitHub evidence:** [Actions run #41188192743, attempt 2](https://github.com/ruslanudintsev-ai/ruslan-ai-lab/actions/runs/41188192743) has Build **SUCCESS**, Deploy **SUCCESS**. The `actions/deploy-pages@v4` log states `Reported success!` and identifies [the Pages environment URL](https://ruslanudintsev-ai.github.io/ruslan-ai-lab/). Initial attempt failed at Pages configuration while the site was disabled; after the owner enabled Pages, the retry passed.
4. **Not yet independently checked:** live external HTTP status, CSS/JS/favicon/404 delivery, all four lab browser interactions, actual iPhone Safari, VoiceOver/NVDA, keyboard/contrast, third-party redistribution notices, device screenshots and rollback exercise. The review environment could not resolve/read the live GitHub Pages domain; this is **not evidence of site failure**. Keep these gates open and log actual PASS/FAIL after inspection.
5. **Future work:** if live defects appear, fix them in targeted reviewable PRs and release a new **exact** SHA only by a separately intentional workflow dispatch. Keep the previous deployed source and artifact available for rollback planning.

**Initial Pages deployment confirmed by GitHub Actions; full live-quality acceptance not certified. NO DNS / NO BILLING / NO PROFILE EDIT / NO OPALUBKA CHANGES.**

**Task tracking:** [P3 Issue #10](https://github.com/ruslanudintsev-ai/ruslan-ai-lab/issues/10).
