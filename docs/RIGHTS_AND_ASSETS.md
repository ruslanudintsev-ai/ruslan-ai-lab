# P1 candidate — asset/rights boundary

**Status:** inventory of the current new project. This is a source audit, **not** legal confirmation of exclusive ownership. Date: 2026-10-30.

| Category | Actual tracked assets | Provenance/decision |
| --- | --- | --- |
| Original local visuals | `public/favicon.svg` | New basic geometric vector made for this project; no remote image embeds |
| CSS-only diagrams | `src/styles/global.css`, `src/pages/index.astro` | Custom layouts/abstract shapes built in-project, no stock photography, external fonts, vendor marks or branded assets |
| Interactive CSS Studio | `src/domain/studio.ts`, `src/scripts/studio.ts`, `src/components/Studio.astro` | New AI-assisted implementation, reviewed/sourced in current repository |
| Case study | `src/pages/case-studies/opalubka/index.astro` | Written description linking public, actual GitHub Opalubka source, PR and Actions. **No copying Opalubka code/media** |
| Build/runtime | Astro, TypeScript, Playwright, axe, transitive npm packages | Third-party distribution licenses belong to their respective package authors. Check exact lockfile and notices before release. |
| Fonts | System default fonts only | No downloaded/embedded fonts |
| Audio/video/3D | None | Future proposed experiments are not working or bundled |

The design and implementation were AI-assisted. The user has **not** yet approved a separate MIT license for this repository; do not copy the Opalubka MIT notice as an assumption. Rights and license decision are a publication blocker pending owner review.

## Locked dependency metadata review (2026-10-31)

The locked install currently lists **447 package entries** in `package-lock.json`. Each entry includes a nonempty license field and version in the lock metadata. This count covers **build/test/platform-optional packages too**, not 447 separate browser assets.

- `node scripts/audit-licenses.mjs` validates nonempty lockfile version/license metadata, verifies direct manifest pins, and generates `quality-results/licenses-report.json` without network access.
- GitHub Actions preserves this evidence at the current exact candidate SHA. Read it together with the built `dist/` artifact, **not** as proof all listed packages are shipped to browsers.
- The initial metadata inventory highlights **36 entries** for extra human attention because their expressions mention LGPL, MPL, FSL or BlueOak. Examples include `@img/sharp-libvips-*` platform variants (LGPL), `lightningcss*` and `axe-core` (MPL), `sentry` (FSL), and `glob` (BlueOak). This is a **review queue**, not a finding of incompatibility or infringement.
- Review third-party package LICENSE/NOTICE files and obligations where relevant to actual redistribution. The npm lockfile's `license` field is not complete legal evidence, and the new project's own license remains **unapproved**.
- Release acceptance and human-device instructions live in [P1 release readiness](./P1_RELEASE_READINESS_2026-10-31.md).

## Reviewer checklist

- Ensure generated `dist/` contains only local SVG, compiled CSS/JS and static HTML; no remote script or third-party media.
- Check no form sends visitor data, no API key, cookie tracking or sensitive file exists in output.
- Verify package dependency notices and licenses prior to distribution; source check alone cannot establish complete legal title to AI-assisted code.
- Approve any newly added public assets or trademark references through this ledger before public release.

**NO_LICENSE_ASSUMED / NO_DEPLOY / NO_BILLING / NO_OPALUBKA_CHANGES.**
