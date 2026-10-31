# Ruslan AI Lab — P1 release-readiness record

**Record date:** 2026-10-31. **Scope:** [P0 Draft PR #1](https://github.com/ruslanudintsev-ai/ruslan-ai-lab/pull/1) and stacked [P1 Draft PR #2](https://github.com/ruslanudintsev-ai/ruslan-ai-lab/pull/2). **State: REVIEW IN PROGRESS / NO MERGE / NO DEPLOY**.

This is a checklist for a human release decision, **not** a release authorization or a declaration that every item passed. It supplements the original [P1 acceptance specification](./P1_MVP_ACCEPTANCE.md), which was authored before implementation and retains historical status text.

## Verified baseline vs open gates

| Area | Evidence / actual status | Release gate |
| --- | --- | --- |
| Functional candidate | P1 contains Astro static site, CSS Studio with bounded controls, and sourced Opalubka case | Implemented in Draft, not public |
| Earlier CI baseline | [Run #41164332493](https://github.com/ruslanudintsev-ai/ruslan-ai-lab/actions/runs/41164332493), exact SHA `9eff7a6c3515b3cc6d1e631ca2d640adcd27214e`: unit 7/7; Chromium 13/13; Firefox 3/3; mobile WebKit 3/3; TypeScript clean | PASS at *that SHA only*; rerun after every source change |
| Responsive evidence | 10 Chromium viewport screenshots (home + lab at 320/360/390/768/1440), 1 mobile WebKit screenshot, retained in run artifact | Automated evidence collected; manual visual review must be recorded separately |
| Local performance | Four Lighthouse Mobile **100** scores on the compiled localhost fixture for the preceding verified SHA | Not a production audit or field Core Web Vitals |
| Browser coverage | Chromium desktop, Firefox desktop, simulated iPhone WebKit | Physical iPhone + actual assistive technology **NOT TESTED** |
| License inventory | New `scripts/audit-licenses.mjs` reads all lockfile package license metadata, checks manifest consistency, and writes `quality-results/licenses-report.json`; CI uploads it | Confirm the **new** head CI passes; manually examine package notices and actual distributed files |
| Ownership and repository license | [Rights ledger](./RIGHTS_AND_ASSETS.md) documents code/assets and independent Opalubka links | **BLOCKED: owner has not selected a standalone license** |
| Source integration | P0 #1 is an unmerged Draft based on `main`. P1 #2 is an unmerged Draft based on P0 | **BLOCKED: separate owner merge GO** |
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

1. Review and explicitly authorize **P0 #1** design/ADR acceptance and merging; until then P0 stays Draft.
2. After P0 is merged, retarget **P1 #2 to `main`** and review its *new* effective diff. Resolve conflicts if any; run full CI at the new exact HEAD.
3. Record reviewer sign-off of screenshots, accessibility limitations, rights and license decision. Only the owner can authorize P1 source merge; leaving PR Draft is intentional until then.
4. Obtain **separate** owner approval for GitHub Pages. Before implementation, check existing Pages configuration and choose a manual exact-SHA compiled-artifact release (never raw Astro/Jekyll branch publishing).
5. Once the site is actually published, verify external HTTP/HTTPS, correct `/ruslan-ai-lab/` path, hashed CSS and JS, favicon, 404 behavior, interactive lab, keyboard, layout, source SHA and rollback. Only then use a live-site status or claim current URL works.

**Boundary:** No automatic merges, Pages deployment, DNS edits, paid services, profile edits, or modifications to `opalubka`.
