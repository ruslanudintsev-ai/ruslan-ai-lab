# P0 — Ruslan AI Lab: design brief & responsive concept

**Status:** `DESIGN_PROPOSAL / P0_ONLY / NOT_BUILT / NOT_DEPLOYED`
**Date:** 2026-10-30. **Owner-facing choice:** visual concept A or B (recommendation below).
**Scope:** distinct from [Opalubka](https://github.com/ruslanudintsev-ai/opalubka); no code, settings, or deployment changes to that project.

## Product thesis

A professional engineering **workbench that can be inspected** — not a futuristic gallery of effects. An engineering manager, developer or prospective collaborator should understand in **10 seconds** what the owner does, try **one working interaction in under a minute**, and reach **real source/CI/review evidence** without invented KPIs.

Positioning: **AI-assisted web engineering / agent operations**. Credit the owner for requirements, constraints, review, orchestration and release decisions; credit AI assistance for actual generated code where relevant. Avoid claiming independent human authorship of all code, production AI agents, customers, deals, income or live services without independent evidence.

**Primary audience:** hiring engineers / technical partners. **Secondary:** curious visitors and developers.
**One promised value:** “Try a small, reproducible experiment and see how it was built.”
**Primary CTA:** “Try CSS Studio”; **secondary CTA:** “View code & evidence”.

## Two original visual directions (proposals, not screenshots)

### A — Midnight Instrument Panel

A dark, high-contrast control console without neon overload. Suitable for showing simulations.

| Token | Proposed value | Usage |
| --- | --- | --- |
| Surface | `#101923` | background |
| Elevated | `#1B2936` | panels |
| Ink | `#EDF3F6` | primary text |
| Muted | `#AFBEC9` | descriptions |
| Accent | `#65D5C2` | interactive highlights |
| Warning | `#FFCA79` | only actual warnings |

Visual grammar: narrow status/eyebrow, modest fine grid, monospaced provenance labels, compact cards, calm depth. **Risks:** looking like a hacker dashboard rather than a portfolio, overuse of low-contrast borders, costly animated glow; mitigate by limiting motion and maintaining generous type.

### B — Precision Editorial Workbench (recommended)

A bright, quietly technical studio with a strong type hierarchy and original diagrams. Evidence and working interactions are foregrounded; easy to read on a phone.

| Token | Proposed value | Usage |
| --- | --- | --- |
| Canvas | `#F5F7F4` | background |
| Paper | `#FFFFFF` | card background |
| Ink | `#18232A` | primary text |
| Secondary | `#53636B` | descriptions |
| Accent | `#146B67` | primary CTA & indicators |
| Outline | `#C8D2D1` | dividers |

Visual grammar: functional engineering-notebook labels, restrained 1px rules, static original SVG schematic, readable 70ch copy, ample whitespace. **Risks:** could feel generic without crafted typography and illustration. Differentiate through interactive before/after panel and visible verified-evidence trail.

**Recommendation: B as default** with optional **user-selected dark theme** inspired by A (not a full second UI design). Pure system font stack, no third-party font downloads, no stock photography or borrowed brand visual assets. Actual foreground/background contrast must be measured before implementation; token proposals alone do **not** prove WCAG compliance.

## Content hierarchy / information architecture (P1)

1. `/` — homepage: hero, “what I do”, featured working lab, evidence cards, one real case study, concise engineering approach, verified GitHub contact link.
2. `/labs/css-studio/` — standalone **working** CSS Studio with accessible controls and a copyable, deterministic CSS snippet. A native quick-demo may also appear on `/`, but should not double-download large code.
3. `/case-studies/opalubka/` — factual project story: what was attempted, owner versus AI roles, specific challenge (Jekyll vs raw Astro), steps taken, checks, exact source/CI links, remaining limitations. Never claim live HTTP/field metrics without fresh evidence.
4. P2 only: `/labs/canvas/`, `/labs/3d/`, `/labs/workflow/`. **Do not create empty teaser routes**; show transparent “planned / not live” cards on homepage, not links to a fake demo.
5. `/404` or static 404 where supported; `robots.txt` and `sitemap.xml` only when production/public deployment is approved.

Top navigation: **Experiments · Case studies · Engineering approach · GitHub**. Use simple links, no ornamental menu on desktop. Accessible menu toggle on narrow mobile if truly needed. Do not collect contact forms. Canonical URL is **undecided** until actual Pages setup; never invent verified metadata URL.

## Responsive wireframes — conceptual only, not rendered designs

### Mobile: 320 / 360 / 390 px

```text
┌─────────────────────────────────┐
│ RUSLAN / AI LAB          [Menu] │
├─────────────────────────────────┤
│ AI-assisted engineering        │
│                                   
│ Build. Test. Show evidence.    │
│ Working experiments and        │
│ reproducible case studies.     │
│ [Try CSS Studio]               │
│ [View source]                  │
├─────────────────────────────────┤
│ ● WORKING LAB / CSS Studio     │
│ [Controls as full-width rows]  │
│ [Live preview 1 column]        │
│ [Copy generated CSS]           │
├─────────────────────────────────┤
│ EVIDENCE / code → CI → review  │
│ [A single truthful case card]  │
│ [Opalubka source + CI links]   │
├─────────────────────────────────┤
│ NEXT / clearly marked planned  │
│ [Canvas] [3D] [Workflow]       │
├─────────────────────────────────┤
│ GitHub · licensing · privacy    │
└─────────────────────────────────┘
```

Controls before preview on narrow screens; preview below, never off-screen canvas or forced horizontal scrolling. Tap targets goal **≥44×44 CSS px**. Buttons visible without hover; copy confirmation announced via `aria-live`.

### Tablet: 768 px

```text
┌─────────────────────────────────────────────────┐
│ Brand       Experiments   Case studies   GitHub  │
├───────────────────────────────┬─────────────────┤
│ Hero copy + 2 actions         │ Original static │
│                               │ lab illustration│
├───────────────────────────────┴─────────────────┤
│ CSS Studio: controls | responsive preview        │
│ Case evidence: two compact cards                 │
└─────────────────────────────────────────────────┘
```

### Desktop: 1440 px

```text
┌────────────────────────────────────────────────────────────────────┐
│ RUSLAN AI LAB        LABS       CASE STUDIES       METHOD     GitHub │
├────────────────────────────────────┬───────────────────────────────┤
│ AI-ASSISTED ENGINEERING             │ ORIGINAL CSS / SVG DIAGRAM    │
│ A working, inspectable portfolio    │ static, no gratuitous animation│
│ [Try CSS Studio]   [Source]         │                               │
├─────────────────────┬──────────────┴───────────────────────────────┤
│ CSS controls panel  │ Live preview + generated code               │
│ selectors and ranges│ accessible, copyable, deterministic         │
├─────────────────────┴──────────────────────────────────────────────┤
│ CASE: OPALUBKA               │ HOW WE WORK: TASK → TEST → REVIEW   │
└────────────────────────────────────────────────────────────────────┘
```

At 1440 px center content in max **1120–1200 px**, 24–32 px desktop gutter. Breakpoints respond to content, not device models. Test 320, 360, 390, 768, 1440 for real evidence.

## UI design tokens — implementation targets

- Typography: `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`; code: `ui-monospace, SFMono-Regular, Consolas, monospace`. Headline `clamp(2.25rem, 5vw, 4.5rem)`; body 1rem–1.125rem and line height 1.55–1.7. Avoid giant, cropped typography on 320 px.
- Space: `4, 8, 12, 16, 24, 32, 48, 64, 96` CSS px; 8px rhythm for sections. Radius 8px inputs, 14–18px cards. Shadows subtle only.
- Focusing: visible `:focus-visible` ring with tested contrast; native button/link semantics. No UI that requires a mouse/gesture to complete its core task.
- Transitions only on transform/opacity, generally 120–180 ms, disabled or reduced for `prefers-reduced-motion: reduce`; no autoplay in P1.
- CSS Studio interactive preview uses finite CSS variables and safe values, no arbitrary DOM injection. Text of the example must remain readable after changing any token.

## Copy sketches (not claims about currently working features)

**English headline:** “Engineering you can try — and verify.”
**English subhead:** “Small, practical web experiments with source code, tests and a transparent AI-assisted workflow.”
**RU headline:** «Инженерия, которую можно попробовать и проверить».
**RU subhead:** «Небольшие веб-эксперименты с открытым кодом, тестами и прозрачной работой с ИИ».
**Working demo card only after implementation:** “CSS Studio — edit, preview, copy”.
**Planned cards:** clearly marked “Planned · not available yet”.

Do not mark any demo “working” until browser QA passes. Cite exact CI links beside case studies. Do not place a misleading badge such as “100% uptime” or “official site”.

## Approval choices

- **Recommended:** B, Precision Editorial Workbench; MVP contains one honest, working CSS Studio + Opalubka source-backed case story. No 3D in initial bundle.
- Alternate: A, Midnight Instrument Panel; same information architecture and testing obligations, higher risk of visual noise.
- Approval should select style, default language, and exact MVP scope. This document does not constitute implementation or deployment approval.

**Boundaries:** P0 documentation only; budget $0; NO MERGE / NO CODE / NO DEPLOY / NO DNS / NO THIRD-PARTY TRACKING / NO OPALUBKA CHANGES.
