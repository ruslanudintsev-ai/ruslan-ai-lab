# Ruslan AI Lab — P1 release-readiness record

**Review record: 2026-10-31.** [P0 PR #1](https://github.com/ruslanudintsev-ai/ruslan-ai-lab/pull/1) was accepted and merged; [P1 PR #2](https://github.com/ruslanudintsev-ai/ruslan-ai-lab/pull/2) passed automated technical acceptance and is the reviewed source candidate. **This record does not authorize or assert a GitHub Pages deployment.** Read PR metadata for current merge state.

This is a checklist for a human release decision, **not** a release authorization or a declaration that every item passed. It supplements the original [P1 acceptance specification](./P1_MVP_ACCEPTANCE.md), which was authored before implementation and retains historical status text.

## Verified baseline vs open gates

| Area | Evidence / actual status | Release gate |
| --- | --- | --- |
| Functional candidate | P1 contains Astro static site, CSS Studio with bounded controls, and sourced Opalubka case | Implemented in Draft, not public |
| Final pre-license technical CI | [Run #41166226087](https://github.com/ruslanudintsev-ai/ruslan-ai-lab/actions/runs/41166226087), exact SHA `3e88ddf5276be7d2f58e3582da27008769b9378f`: unit **9/9**, Chromium **13/13**, Firefox + mobile WebKit **6/6**, local Lighthouse Mobile **100** in all four categories, 11 screenshots, TS/build and license metadata PASS | PASS at that SHA; **newer licensing/documentation-only commit needs its own exact-head CI** |
| Responsive evidence | 10 Chromium viewport screenshots (home + lab at 320/360/390/768/1440), 1 mobile WebKit screenshot, retained in run artifact | Automated evidence collected; manual visual review must be recorded separately |
| Local performance | Four Lighthouse Mobile **100** scores on the compiled localhost fixture for the preceding verified SHA | Not a production audit or field Core Web Vitals |
| Browser coverage | Chromium desktop, Firefox desktop, simulated iPhone WebKit | Physical iPhone + actual assistive technology **NOT TESTED** |
| License inventory | `scripts/audit-licenses.mjs` reports 447 entries, 0 metadata/manifest errors, 36 license-expression entries for human review; CI archives exact-SHA evidence | Metadata PASS at previous SHA; manually review license notices and actual redistributed files |
| Ownership and repository license | [Root MIT LICENSE](../LICENSE) and [rights ledger](./RIGHTS_AND_ASSETS.md) distinguish owner-controlled source from independent third-party rights | **MIT adopted for owner's rights.** Third-party notice obligations remain independently reviewable |
| Source integration | **P0 #1 accepted and squash-merged** into `main` at `b3b335fbe1f99cad9eaa42821310086a93bb44e7`. P1 #2 retargeted to `main`, with clean ancestry and standalone source license included | Record exact-head CI and owner source-merge acceptance separately from Pages publishing |
| Public website | No approved GitHub Pages release | **BLOCKED: separate owner deployment GO** |

## Manual QA instructions (record PASS/FAIL, device, date and evidence before release)

- [ ] **NVDA + Firefox on Windows**: enable screen reader; navigate skip link, headings, navigation, five labels/selects, generated CSS textarea, Reset and Copy with keyboard. Verify state announcements are concise, control names make sense, and focus stays predictable. Record actual assistive-tech versions.
- [ ] **VoiceOver + Safari (if available)**: repeat the key path, including code selection and clipboard fallback. Do not call mobile WebKit emulation a physical-device test.
- [ ] **Physical iPhone Safari (if available)**: inspect 320/390-like layouts, keyboard usability, native select dialogs, copy success/failure, body overflow and external links. Record model/iOS version. If unavailable, mark *not tested*, not PASS.
- [ ] **Visual/contrast**: open retained 11 screenshots from the exact-head workflow; inspect readability, focus indicator, min-width overflow, light backgrounds and actual generated CSS at narrow width. Validate text and controls' contrast via a checker or manual reference, not color intuition.
- [ ] **Privacy/content**: inspect compiled `dist/` for remote scripts/fonts, tracking, forms, accidental secrets, unsupported claims, inaccurate labels or live-status promises. Verify source links still land on the claimed GitHub records.
- [ ] **Dependency rights**: read the exact-head license metadata artifact, verify relevant package LICENSE/NOTICE terms (especially LGPL/MPL/FSL/BlueOak records) and distinguish build-time tooling from assets actually distributed in `dist/`. The lockfile field is a clue, not proof of compliance.
- [x] **Own-source MIT decision recorded**: the separate repository contains its own MIT [`LICENSE`](../LICENSE). This does not automatically convey rights in third-party dependencies or Opalubka; separate package notices still require review where applicable.

## Controlled integration sequence

1. **COMPLETE (2026-10-31):** P0 #1 was accepted against the original design brief and merged into `main` with squash SHA `b3b335fbe1f99cad9eaa42821310086a93bb44e7`. No Pages deployment followed.
2. **BASE RETARGET COMPLETE:** P1 #2 targets `main`; Git ancestry includes P0 merge without force-pushing P1. Final exact-head CI and effective diff must be rechecked after this licensing documentation update. A source merge is **not** a Pages deployment.
3. Recorded automated screenshot, keyboard, static artifact/privacy and source evidence reviews. A real preview caption contrast defect (4.22:1) was fixed (~5.33:1) with regression tests. **Manual NVDA/VoiceOver/physical iPhone checks remain untested**, and may not be reported as PASS. Document these known limits separately from the source-merge decision.
4. Obtain **separate** owner approval for GitHub Pages. Before implementation, check existing Pages configuration and choose a manual exact-SHA compiled-artifact release (never raw Astro/Jekyll branch publishing).
5. Once the site is actually published, verify external HTTP/HTTPS, correct `/ruslan-ai-lab/` path, hashed CSS and JS, favicon, 404 behavior, interactive lab, keyboard, layout, source SHA and rollback. Only then use a live-site status or claim current URL works.

**Boundary:** No automatic merges, Pages deployment, DNS edits, paid services, profile edits, or modifications to `opalubka`.
