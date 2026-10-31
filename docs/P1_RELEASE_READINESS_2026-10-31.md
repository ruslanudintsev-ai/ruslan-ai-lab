# Ruslan AI Lab — P1 release-readiness record

**Record date:** 2026-10-31. **Scope:** [P0 PR #1 — MERGED](https://github.com/ruslanudintsev-ai/ruslan-ai-lab/pull/1) and [P1 Draft PR #2 — ON MAIN, UNMERGED](https://github.com/ruslanudintsev-ai/ruslan-ai-lab/pull/2). **State: P0 ACCEPTED / P1 TECHNICAL REVIEW IN PROGRESS / NO P1 MERGE / NO DEPLOY**.

This is a checklist for a human release decision, **not** a release authorization or a declaration that every item passed. It supplements the original [P1 acceptance specification](./P1_MVP_ACCEPTANCE.md), which was authored before implementation and retains historical status text.

## Verified baseline vs open gates

| Area | Evidence / actual status | Release gate |
| --- | --- | --- |
| Functional candidate | P1 contains Astro static site, CSS Studio with bounded controls, and sourced Opalubka case | Implemented in Draft, not public |
| Last fully verified pre-acceptance CI | [Run #41165242996](https://github.com/ruslanudintsev-ai/ruslan-ai-lab/actions/runs/41165242996), exact SHA `e7d04a78b147428d8baee2fb477982850bceeeee`: unit 7/7, Chromium 13/13, Firefox 3/3, mobile WebKit 3/3, TS/build PASS, license metadata PASS | PASS at that SHA; **newer color contrast fix and branch-integration commit still require their own green run** |
| Responsive evidence | 10 Chromium viewport screenshots (home + lab at 320/360/390/768/1440), 1 mobile WebKit screenshot, retained in run artifact | Automated evidence collected; manual visual review must be recorded separately |
| Local performance | Four Lighthouse Mobile **100** scores on the compiled localhost fixture for the preceding verified SHA | Not a production audit or field Core Web Vitals |
| Browser coverage | Chromium desktop, Firefox desktop, simulated iPhone WebKit | Physical iPhone + actual assistive technology **NOT TESTED** |
| License inventory | `scripts/audit-licenses.mjs` reports 447 entries, 0 metadata/manifest errors, 36 license-expression entries for human review; CI archives exact-SHA evidence | Metadata PASS at previous SHA; manually review license notices and actual redistributed files |
| Ownership and repository license | [Rights ledger](./RIGHTS_AND_ASSETS.md) documents code/assets and independent Opalubka links | **BLOCKED: owner has not selected a standalone license** |
| Source integration | **P0 #1 accepted and squash-merged** into `main` at `b3b335fbe1f99cad9eaa42821310086a93bb44e7`. P1 #2 retargeted to `main`; P0 merged-history parent integrated without rewriting existing history | P1 remains Draft/unmerged; check final SHA CI and explicit owner license/release acceptance |
| Public website | No approved GitHub Pages release | **BLOCKED: separate owner deployment GO** |

## Manual QA instructions (record PASS/FAIL, device, date and evidence before release)

- [ ] **NVDA + Firefox on Windows**: enable screen reader; navigate skip link, headings, navigation, five labels/selects, generated CSS textarea, Reset and Copy with keyboard. Verify state announcements are concise, control names make sense, and focus stays predictable. Record actual assistive-tech versions.
- [ ] **VoiceOver + Safari (if available)**: repeat the key path, including code selection and clipboard fallback. Do not call mobile WebKit emulation a physical-device test.
- [ ] **Physical iPhone Safari (if available)**: inspect 320/390-like layouts, keyboard usability, native select dialogs, copy success/failure, body overflow and external links. Record model/iOS version. If unavailable, mark *not tested*, not PASS.
- [ ] **Visual/contrast**: open retained 11 screenshots from the exact-head workflow; inspect readability, focus indicator, min-width overflow, light backgrounds and actual generated CSS at narrow width. Validate text and controls' contrast via a checker or manual reference, not color intuition.
- [ ] **Privacy/content**: inspect compiled `dist/` for remote scripts/fonts, tracking, forms, accidental secrets, unsupported claims, inaccurate labels or live-status promises. Verify source links still land on the claimed GitHub records.
- [ ] **Dependency rights**: read the exact-head license metadata artifact, verify relevant package LICENSE/NOTICE terms (especially LGPL/MPL/FSL/BlueOak records) and distinguish build-time tooling from assets actually distributed in `dist/`. The lockfile field is a clue, not proof of compliance.
- [ ] **Owner license decision**: choose a clear license (or a deliberate different policy) for this *new* repository; confirm any third-party asset conditions. Do not silently inherit Opalubka's MIT license.

## Controlled integration sequence

1. **COMPLETE (2026-10-31):** P0 #1 was accepted against the original design brief and merged into `main` with squash SHA `b3b335fbe1f99cad9eaa42821310086a93bb44e7`. No Pages deployment followed.
2. **BASE RETARGET COMPLETE:** P1 #2 now targets `main`; Git ancestry includes P0 merge without force-pushing P1. Recheck the final P1 effective diff and **require a green run at the final commit SHA** before release acceptance.
3. Record reviewer sign-off of screenshots, accessibility limitations, rights and license decision. A real contrast defect was found in small preview status text (4.22:1 against the preview background) and corrected to approximately 5.33:1 with regression tests. **Manual NVDA/VoiceOver/physical-device checks remain untested.** Keep P1 Draft until remaining owner policy and QA gates are resolved.
4. Obtain **separate** owner approval for GitHub Pages. Before implementation, check existing Pages configuration and choose a manual exact-SHA compiled-artifact release (never raw Astro/Jekyll branch publishing).
5. Once the site is actually published, verify external HTTP/HTTPS, correct `/ruslan-ai-lab/` path, hashed CSS and JS, favicon, 404 behavior, interactive lab, keyboard, layout, source SHA and rollback. Only then use a live-site status or claim current URL works.

**Boundary:** No automatic merges, Pages deployment, DNS edits, paid services, profile edits, or modifications to `opalubka`.
