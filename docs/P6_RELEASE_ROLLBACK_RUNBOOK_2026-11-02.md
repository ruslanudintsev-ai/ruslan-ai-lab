# Ruslan AI Lab — manual Pages release and rollback runbook

**Prepared:** 2026-11-02. **Status:** documented procedure only; **rollback has not been executed or tested against a live failed deployment**. This procedure is now included in P6 published source; it does **not** authorize any future source merge, workflow change or release. Actual recovery/rollback remains untested.

## 1. Verified anchors (do not confuse source with deployment)

| Stage | Evidence | Status at review |
| --- | --- | --- |
| First four-lab Pages | [GitHub Actions #41188192743](https://github.com/ruslanudintsev-ai/ruslan-ai-lab/actions/runs/41188192743), source SHA `75b5d2e224acad07de76db3c6cbbb12f26f060e5` | Historical successful publication |
| P4, five-lab Pages | [Actions #41192989794](https://github.com/ruslanudintsev-ai/ruslan-ai-lab/actions/runs/41192989794), source SHA `1c13d0d3f965efc2582d38aea63aaedef8834a56` | Historical successful publication |
| P5 cases | [manual Actions #41422579256](https://github.com/ruslanudintsev-ai/ruslan-ai-lab/actions/runs/41422579256), SHA `b1f3be88537e0444971b2f4620744fb2f74745c3`, [acceptance Issue #18](https://github.com/ruslanudintsev-ai/ruslan-ai-lab/issues/18) | Historical verified live deployment (2026-11-02) |
| P6 public directory | [PR #25](https://github.com/ruslanudintsev-ai/ruslan-ai-lab/pull/25), [read-only CI #41423475759](https://github.com/ruslanudintsev-ai/ruslan-ai-lab/actions/runs/41423475759), [manual Pages #41423985872](https://github.com/ruslanudintsev-ai/ruslan-ai-lab/actions/runs/41423985872) at `a8071b36be54416f30b6970ec4a758d8b749f9b4` | **Latest verified deployment**; HTTP 200 `/projects/`, provenance exact SHA |

A successful candidate PR workflow is **never** a Pages deployment. Pages workflow `.github/workflows/pages-first-release.yml` needs a manual `workflow_dispatch` on **main** with the exact `expected_sha`; it checks out that SHA, runs its build/static checks and publishes `dist/`. Ordinary source merges do not deploy.

## 2. Preflight and approval (human owner)

1. Verify there are no other deployments in progress and inspect current GitHub `main` SHA **again**, not the SHA shown in an old chat or README.
2. Confirm the intended change and its source review/CI PASS. Check `main` contains only the owner-approved release scope. The default publishing job **does not itself rerun Chromium/Firefox/WebKit E2E**; those run in separate candidate QA.
3. Require the owner's explicit permission to publish that specific release. Do not assume a merge, QA pass, comment, or a scheduled automation supplies approval.
4. In **Actions → Ruslan AI Lab / first owner-approved GitHub Pages release → Run workflow**, select `main`, enter the current exact 40-character SHA in `expected_sha`. Absent authorization or a mismatch: **stop**. CI enforces `RELEASE_SHA_MISMATCH` against GitHub's checked-out `github.sha`.
5. Do not change the protected manual `workflow_dispatch` condition or try to deploy a Draft branch to bypass an approval.

**Historical P5 provenance limitation:** the P5 Pages artifact stamped `OWNER_APPROVAL=2026-10-31`, a historically fixed date **not** an approval timestamp for its 2026-11-02 release. The verified source-only [PR #26](https://github.com/ruslanudintsev-ai/ruslan-ai-lab/pull/26) was subsequently merged as `main@63ad5dfc1438ac6130818f314035ce262f369443`, replacing this field for future releases with actual `RELEASE_EVENT`, `RELEASE_RUN_ID` and `RELEASED_AT_UTC`. These fields report workflow execution only: **never interpret them as human approval**. Owner direction and run acceptance still require a separate record.

## 3. Post-deployment verification

After GitHub reports the workflow is finished:

- Require both `build` and `deploy` to have **SUCCESS**, and verify the run's source SHA equals the approved `main` commit. Verify no unexpected queued run is racing to publish.
- Inspect `https://ruslanudintsev-ai.github.io/ruslan-ai-lab/RELEASE_PROVENANCE.txt` for `SOURCE_SHA=<approved-sha>` and `BASE_PATH=/ruslan-ai-lab/`. The stamp is a site-generated source record, not an independent legal/QA guarantee.
- Check `/`, `/labs/css-studio/`, `/labs/canvas/`, `/labs/3d/`, `/labs/workflow/`, `/labs/browser-apis/`, `/404.html`, `/favicon.svg` under the **`/ruslan-ai-lab/` prefix**; verify HTTP responses, compiled CSS/JS network requests and navigation.
- For a P5 release, additionally check `/case-studies/webkit-frame/` and `/case-studies/release-gates/`. For P6 **only after a separate owner-authorized merge and release**, check `/projects/`.
- Browser smoke: 320/390/1440px, keyboard focus and navigation; P4 board reorder and explicit Save/restore/Clear; no unexpected outbound network. Real iPhone, VoiceOver/NVDA, manual contrast and license NOTICE checks remain separately unverified until independently tested.
- Add exact SHA, Actions link, actual HTTP/browser evidence, notes and time to release issue. **Never mark DEPLOY_OK solely from the GitHub green icon**.

## 4. Rollback decision and supported methods

**STOP condition:** incorrect site version, route/asset failures, security/privacy regression, serious user-facing failure, or wrong SHA. Freeze any further merges/dispatches until the previous known-good source and release can be identified.

**Preferred low-risk recovery:** If the public P4 site is still serving correctly, **do not modify or 'roll back' unnecessarily**. For a future failed P5/P6 publish, prepare a new reviewed commit on `main` whose source restores the previous known-good functionality, usually with `git revert` of the exact offending feature commits in *reverse integration order*. Do not force-push or reset shared `main`. Example **illustration, not a command to run blindly**:

```bash
git checkout main
git pull --ff-only
git log --oneline -8
# Select exact offending merged commits after review, revert in reverse order:
git revert <bad-merged-sha>
# Resolve conflicts and run CI before any release; preserve a reviewable PR.
```

One revert of the P5 commit may restore prior functionality but not identical old source tree if later source/docs changed. To claim exact P4 restoration, compare the **Git tree** and key built behavior against the previously deployed P4 `1c13d0d3f965efc2582d38aea63aaedef8834a56`. Require new source CI and a fresh human release decision. A new `main` rollback commit has **its own SHA**, so `expected_sha` must be that new SHA, **not** the historical P4 SHA. Retest after deploying it.

**Potential alternate:** re-running a prior successful Pages workflow might redeploy its earlier artifact, but artifact availability, GitHub rerun semantics and permissions have **not** been verified here; do **not** present that as a proven rollback method.

If the rollback candidate cannot be verified, leave the website as-is unless an incident commander authorizes a safer mitigation. Do not disable workflow SHA guards, leak tokens, change DNS, delete branches or overwrite history.

## 5. Proof status

- [x] Historical first and P4 deployment SHA/run identified from GitHub records.
- [x] Exact-SHA source workflow and candidate/deploy separation inspected.
- [x] Rollback **procedure** documented with guardrails and caveats.
- [ ] Rollback live drill or controlled source restoration **performed and verified**.
- [ ] Actual future P5/P6 external live HTTP and browser evidence recorded.
- [ ] Physical Safari/VoiceOver/NVDA, manual contrast and third-party redistribution NOTICE clearance documented.

Track these remaining independent tasks in [Issue #15](https://github.com/ruslanudintsev-ai/ruslan-ai-lab/issues/15).
