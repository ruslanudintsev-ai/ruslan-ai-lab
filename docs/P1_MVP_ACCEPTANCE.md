# P1 — first working MVP: scope, tasks and acceptance

**Status:** `SPEC_CANDIDATE / NOT_IMPLEMENTED / NO_DEPLOY` (2026-10-30).
**Dependencies:** [P0 design options](./P0_DESIGN_BRIEF.md), [architecture ADR](./P0_ARCHITECTURE_ADR.md), [owner portfolio roadmap](https://github.com/ruslanudintsev-ai/projects-hq/issues/33).
**Recommended scope:** one honestly working CSS Studio + verifiable Opalubka case; build in a separate Draft PR after owner style/scope decision. Cost target **$0**.

## Outcomes and boundary

A visitor must be able to **try the CSS Studio, change a token, see the preview update, copy generated CSS**, and inspect an external source link and truthful engineering case. A visually impressive homepage without a working experiment is **not accepted**. Do not deploy, merge, create subscriptions, edit GitHub profile or touch Opalubka as a side effect of implementation.

### In scope for first candidate

- Astro static project + pinned dependency lockfile, strict TS and meaningful accessible component split.
- Homepage with intro, navigation, one **functional** lab link, current working/planned status labels, one externally sourced case and honest engineering process.
- Interactive CSS Studio with `accent`, `radiusPx`, `columns`, `gapPx` and `motion` finite bounded options. Deterministic preview and generated, copyable CSS; reset; keyboard; reduced motion; local fallback when clipboard denied.
- Opalubka case study with explicit owner/AI roles, real GitHub repo/PR/Actions links, dated source facts and manual-audit gaps. Do not claim fake clients, conversions, uptime, current HTTP availability, code ownership exclusivity or production online AI.
- Simple clean 404 page, title/description, robots and canonical only after actual hostname known. Link to GitHub profile (no visitor PII forms).
- English copy at launch **unless owner chooses bilingual**. RU translation should be complete and structurally symmetric when added: no empty route, machine-looking placeholder or false language switcher.
- Use only original CSS/SVG. Separate rights ledger, owner-selected license in this repo before publication.

### Explicitly out of scope for P1

Canvas animation, Three.js/WebGL, real AI requests, GitHub OAuth, live issue/PR APIs, statistics dashboards, PWA, contact forms, CRM, premium API integrations, tracking, network-dependent backgrounds, runtime LLM agent control, rewrites of Opalubka.

## Implementation slices and reviewer evidence

| Slice | Deliverables | Gate |
| --- | --- | --- |
| S0 foundation | minimal Astro app, routes, design tokens, lockfile, read-only quality CI | `astro check` clean, root + nested-base build verified |
| S1 home | semantic hero/nav, CTAs, working vs planned states, responsive original illustration | snapshots 320/360/390/768/1440; heading/link/navigation keyboard QA |
| S2 CSS Studio | pure TS generation function, controls, preview, reset, copy fallback | deterministic unit fixtures + Playwright user interactions |
| S3 case study | structured evidence with exact links, limitation notes, AI credit | all URLs reviewed; evidence dates; no unsupported business claims |
| S4 quality/rights | tests, axe, accessibility notes, asset ledger, README docs, static artifact | all checks green; independent review; owner acceptance |

## Binary acceptance: must pass before owner considers merge

### Visual/responsive and UX

- [ ] At **320, 360, 390, 768 and 1440px**, all routes have no horizontal overflow, no clipped labels/controls, readable body text, no broken layout.
- [ ] Main CTA opens a real tool; secondary CTA opens verified source. All planned cards explicitly say **Planned / not live**, with no fake “Try” action.
- [ ] Keyboard-only user can navigate menu, form controls, preview and copy action; escape closes any modal (prefer no modal in MVP).
- [ ] Skip-to-content visible on focus, one H1 per page, labels and instructions read by assistive technology. Screen-reader manual test needed when possible; automated axe PASS is not equivalence.
- [ ] `prefers-reduced-motion: reduce` removes nonessential animations; page remains usable with JS disabled (static content and clear “enable JavaScript to try the interactive tool” label; no dead fake functionality).

### Real CSS Studio interactions

- [ ] Changing accent visibly changes preview and CSS text, but only among allowed values.
- [ ] Changing `radiusPx`, `columns`, `gapPx` alters both preview and generated CSS; changes are bounded and deterministic across reloads.
- [ ] `Reset` restores the initial state and generated CSS; no stale visual or hidden asynchronous state.
- [ ] `Copy CSS` copies exactly the displayed CSS after user gesture; disabled Clipboard API or denied permission exposes selectable code and a truthful fallback notice.
- [ ] No unsanitized HTML, JS, unknown CSS URLs or remote fonts injected by controls; inputs never ask for or transmit credentials.
- [ ] No screen-reader spam: one concise live status update, not one announcement on every range tick. No forced focus jumps.

### Quality & evidence

- [ ] `npm ci` from committed lockfile works on a clean runner; `astro check` 0 errors; no unit failures.
- [ ] Automated Playwright end-to-end tests cover homepage→lab, all key controls, reset, copy/fallback, case links, main keyboard path, at least Chromium on a nested `/ruslan-ai-lab/` path fixture. Add additional engines if available; disclose actual results.
- [ ] Automated accessibility scan passes for covered states; manual contrast/keyboard/reduced-motion checklist reviewed. Color choices tested, not asserted based on hex values.
- [ ] Target **lab Lighthouse Performance ≥90 mobile**, report full Accessibility/SEO/Best Practices and raw logs. This is a target, not an achieved metric or Core Web Vitals field data.
- [ ] No third-party network requests on local test pages without explicit rights/privacy approval; no API tokens or personally identifiable info in JS bundles.
- [ ] Evidence artifacts include test result, screenshot per required width, exact source SHA, working/static build `index.html` and hashed CSS/JS paths.
- [ ] New project license selected and included with rights ledger. Link to original case sources; do not assume Opalubka's MIT grant applies to all new/generated assets.
- [ ] CI jobs use read-only GitHub permissions and no deployment action. A passing build or published artifact is **not** publication.

## Release gates

1. **P0 owner decision:** choose A/B style, English-first or RU/EN, initial licensing preference, P1 slices.
2. **P1 Draft PR:** Codex implements code in the new repo only; screenshots, fixtures, CI and case evidence attached. Not mergeable by intention until owner review.
3. **Owner merge GO** (separate). Freeze source SHA, check tests and file inventory before merging.
4. **Owner deployment GO** (another separate decision). Confirm correct Pages project subpath and existing Pages settings, configure manual release workflow with SHA pin and verified production environment. Never blindly repeat Opalubka's old branch/Jekyll mistake.
5. **Live acceptance:** after authorized deployment, test actual public address (HTTP+HTML, hashed CSS/JS, favicon, actions, keyboard, 320–1440, provenance, rollback). Only then mark live demo **Working** and publish its link.

## Suggested Codex handoff after P0 approval (not yet an execution order)

> Implement P1 **only** in `ruslanudintsev-ai/ruslan-ai-lab`, on a new branch and Draft PR. Build Astro/strict TS static site using approved design brief and ADR. Include one real deterministic CSS Studio, accessible keyboard controls, reduced-motion support, real Opalubka case with exact source links, and read-only CI. Add reproducible unit/Playwright and five-viewport screenshot evidence. Avoid new services, forms, external images/fonts and paid APIs. Do not merge or deploy. If approval choices are unresolved, leave visible TODO notes instead of inventing policy.

## Owner decision points

1. **Visual:** B (Precision Editorial Workbench) proposed default; A optional.
2. **Language:** English-first, Russian as second milestone (recommended), or complete RU/EN simultaneously.
3. **First interactive lab:** CSS Studio (recommended) vs Canvas Lab; P1 only ONE.
4. **License:** separately approve repository-level MIT or another option after rights inventory.
5. **Implementation authorization:** P0 approval **does not itself merge or deploy**.

**State marker:** P1 has not started in GitHub at the time this document is authored; assess live repo before any follow-on action.
