# P6 — Public project directory: evidence and privacy gate

**Review date:** 2026-10-31. **Stage:** SOURCE-ONLY candidate in Draft PR; **not deployed**. See [roadmap #21](https://github.com/ruslanudintsev-ai/ruslan-ai-lab/issues/21) and [P6 acceptance #22](https://github.com/ruslanudintsev-ai/ruslan-ai-lab/issues/22).

## Publication policy

Only public repositories with directly inspectable source and history may appear in the directory by default. A repo being readable to its owner does **not** give permission to publicly expose its private source, internal GitHub issue numbers, server IPs, credentials, customer facts, metrics or unpublished financial outcomes.

Any further case from a private project requires explicit owner selection and approval of a sanitized public evidence package. Do not present internal CI or private source as public links.

## Verified inclusion candidates

| Entry | Public source | Evidence | What cannot be asserted |
| --- | --- | --- | --- |
| Ruslan AI Lab | [public repo](https://github.com/ruslanudintsev-ai/ruslan-ai-lab) | Five functioning native-browser experiments, [PR #17](https://github.com/ruslanudintsev-ai/ruslan-ai-lab/pull/17), [P4 owner-dispatched Pages #41192989794](https://github.com/ruslanudintsev-ai/ruslan-ai-lab/actions/runs/41192989794) at SHA `1c13d0d3f965efc2582d38aea63aaedef8834a56` | Subsequent `main` commits do not prove a new Pages release; local Lighthouse is not field Core Web Vitals |
| Opalubka / LAB | [public repo](https://github.com/ruslanudintsev-ai/opalubka), [public README](https://github.com/ruslanudintsev-ai/opalubka/blob/main/README.md) | Educational Astro/TypeScript static website demo, [Astro PR #5](https://github.com/ruslanudintsev-ai/opalubka/pull/5), transparent README privacy/release limits | No independently verified live Pages deployment stated; never imply a real rental company, prices, transactions or customers |

## Acceptance for this candidate

1. Pages route `/projects/` must work both at `/` and under the deployed base prefix `/ruslan-ai-lab/`.
2. Public directory has exactly two approved source references; avoid private project names and speculative metrics.
3. Distinguish source, tests and deployment in copy; each public link must go to actual GitHub history or a local working case.
4. Accessible keyboard, no-JavaScript readability, axe WCAG A/AA, 320/360/390/768/1440 responsive screenshots, simulated mobile WebKit/Firefox and no third-party resource requests.
5. The `README` must not claim this P6 Draft route is currently available on the published site.
6. Code remains **Draft / NOT MERGED / NOT DEPLOYED** until review; successful CI is not owner approval.

## Disclosure discipline

This is an example of public, independently verifiable engineering work. Do not add contacts, finance, customer claims, external tracking, paid services, private repos or internal data. A separate human review of future cases is required.
