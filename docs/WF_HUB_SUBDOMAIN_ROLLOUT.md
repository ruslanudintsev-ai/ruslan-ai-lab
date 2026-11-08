# AI Lab at lab.wf-hub.ru — isolated deployment and reciprocal links

Status: **PREPARATION ONLY (2026-11-08)**. Owner requested `lab.wf-hub.ru` behind a password. DNS and SSH readiness were reported by the owner, but the current server configuration and live authentication have **not been independently verified in this task**. Nothing in this document grants deployment rights to WF-HUB's existing release files.

## Connected projects, intentionally separate

| | WF-HUB | Ruslan AI Lab |
| --- | --- | --- |
| Public address | https://wf-hub.ru/ | Intended: https://lab.wf-hub.ru/ |
| Source | [private wf-hub.ru repository](https://github.com/ruslanudintsev-ai/wf-hub.ru) | [public ruslan-ai-lab repository](https://github.com/ruslanudintsev-ai/ruslan-ai-lab) |
| Stack | Existing Warface static site / Deployment V2 | Astro static build, standalone output |
| Release | Own exact production file scope, backup and rollback | Own independent build, password gate, rollback |

No git submodule, shared deploy key, shared checkout, cross-repository write token, shared `dist/` or direct copy into the WF-HUB docroot. Source links are documentation, not automatic cross-repository authorization. AI Lab may backlink to https://wf-hub.ru/; WF-HUB public links to the lab only **after** the lab passes its security and deployment gate.

## Gate A — check host before changes

1. Read-only inspect current DNS A/AAAA, HTTP(S) response, TLS certificate, hosting control panel/service configuration, server ownership, available disk and the exact configured roots for **both** hostnames. Treat any prior verbal DNS/SSH confirmation as a lead, not production evidence.
2. Record current WF-HUB production release ID, symlink, manifest and both immutable Google/Yandex verification proof hashes. **No change to WF-HUB `current`, nginx vhost, files, headers or backups.**
3. Confirm whether the server uses Nginx, Apache or a hosting panel; write a host-specific configuration only after confirming that software. Do not apply an illustrative configuration blindly. Separate Lab vhost and isolated release directory. Preserve a verifiable snapshot of server config before editing.
4. Verify that no existing host/domain route or default-vhost fallback can bypass authentication; deny unintended IP-based, alternate port and HTTP cleartext access.

## Gate B — compile the right target

Astro paths depend on target hosting:

- GitHub Pages currently uses `DEMO_BASE_PATH=/ruslan-ai-lab/`. Preserve its existing manually gated release workflow. Do **not** silently repurpose the GitHub Pages pipeline.
- For root deployment at `https://lab.wf-hub.ru/`, build from an exact approved source SHA with `DEMO_BASE_PATH=/`. Run `npm ci`, `npm run check`, `npm test`, `npm run build`, `node scripts/check-build.mjs`, and `node scripts/release-preflight.mjs --dir dist --base /` plus browser smoke. No dependencies from or write access to the WF-HUB checkout.
- Record build manifest/hashes, verify `index.html`, `_astro` CSS/JS, `favicon.svg`, `/projects/`, labs, tools, case studies and `/404.html`. The compiled output must **not** retain the Pages `/ruslan-ai-lab/` path.
- Use an isolated, versioned Lab deployment directory, verify its contents, then switch only the *Lab* vhost's active target after approval and with a tested rollback pointer. No recursive mirroring into the WF-HUB production root.

## Gate C — password security

- The password gate must run at the **web server/reverse proxy** before static content and assets are served. Require HTTPS and redirect or reject cleartext HTTP; enable an appropriate TLS certificate.
- If Nginx is actually installed, one possible configuration mechanism is `auth_basic` and `auth_basic_user_file` with a hashed credential file stored **outside** the document root, accessible only to the server's runtime identity. Otherwise use the hosting stack's native equivalent; never infer the stack.
- Generate a unique strong password in a secure environment. Do **not** put plaintext passwords, htpasswd files, keys, server addresses, tokens or auth headers in GitHub commits, PRs, CI logs or screenshots.
- Require unauthenticated `GET / `, `/projects/`, `/labs/css-studio/` and `/_astro/<real-asset>` to return **401** with `WWW-Authenticate` and no protected body. Wrong credentials must be 401; valid credentials must return expected 200/404 and render assets. Verify by browser with clean cookies/session and exact Host/SNI.
- For non-indexed lab, configure `X-Robots-Tag: noindex, nofollow, noarchive` as a defense-in-depth header; this is **not** an access-control substitute.
- **Critical:** `https://ruslanudintsev-ai.github.io/ruslan-ai-lab/` is a separately published **public** GitHub Pages copy (the repo itself is public). An HTTP password gate on `lab.wf-hub.ru` cannot protect those identical files. Before claiming the *Lab content* is private, disable Pages publication (or deliberately accept that the Lab remains public elsewhere), and verify the old Pages site no longer exposes the build. Do not disable publication or change repository visibility as an accidental side effect of these link changes; the owner should authorize that separate scope.

## Gate D — controlled release and reciprocal public link

1. Obtain fresh CI and exact-SHA review and the owner's approval for the Lab-specific deployment. Snapshot current Lab version/config if any. Publish to the separate Lab vhost, run 401/200 and browser checks and verify release marker and rollback.
2. Only after the password gate passes, prepare a **separate WF-HUB content/release PR** for one unobtrusive “AI Lab (requires password)” reference, preferably in a project/owner area rather than contaminating Warface player instructions. If this changes shared layout, account for all 44 generated HTML pages, their content baselines and exact deployment allowlist. Test Google/Yandex proof files byte-for-byte and all 44 Warface routes.
3. Keep both existing deployment workflows/approval gates. A passing QA PR or a merged cross-link does **not** automatically authorize either production release.
4. Recheck `wf-hub.ru` and `lab.wf-hub.ru` independently and verify normal, broken-password and rollback cases. Save exact source SHAs and evidence in both repositories.

**Failure policy:** Any missing 401, wrong root, unverifiable credentials/TLS, old public bypass that conflicts with privacy goals, or changed WF-HUB verification proof is a hard stop. Roll back only Lab's isolated release/config if touched; do not change WF-HUB as a workaround.
