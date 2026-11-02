import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const pages = readFileSync(new URL("../../.github/workflows/pages-first-release.yml", import.meta.url), "utf8");

test("manual Pages release still requires the exact approved main SHA", () => {
  assert.ok(pages.includes("  workflow_dispatch:"), "manual dispatch must remain enabled");
  assert.ok(pages.includes("      expected_sha:"), "manual dispatch must require expected SHA");
  assert.ok(pages.includes('test "${{ github.ref }}" = refs/heads/main'), "must pin publishing to main");
  assert.ok(pages.includes('test "$SOURCE_SHA" = "${{ inputs.expected_sha }}"'), "must fail on incorrect SHA");
  assert.ok(pages.includes("github.event_name == 'workflow_dispatch'"), "manual dispatch must remain part of the job gate");
  assert.ok(pages.includes("group: ruslan-ai-lab-pages"), "deploy concurrency lock must remain");
  assert.ok(pages.includes("      - '.github/workflows/pages-first-release.yml'"), "automatic trigger scope must remain the workflow file itself");
});

test("release provenance describes this Actions run without inventing fresh human approval", () => {
  assert.ok(pages.includes("RELEASE_EVENT=%s"), "missing run event");
  assert.ok(pages.includes("RELEASE_RUN_ID=%s"), "missing run identifier");
  assert.ok(pages.includes("RELEASED_AT_UTC=%s"), "missing build UTC timestamp");
  assert.ok(pages.includes('"${{ github.event_name }}"'), "event must be from GitHub context");
  assert.ok(pages.includes('"${{ github.run_id }}"'), "run id must be from GitHub context");
  assert.ok(pages.includes("SOURCE_SHA=%s"), "exact source SHA must remain in provenance");
  assert.ok(pages.includes("HUMAN_DEVICE_QA=PENDING_POST_RELEASE"), "unverified human QA must remain disclosed");
  assert.doesNotMatch(pages, /OWNER_APPROVAL=\d{4}-\d{2}-\d{2}/, "a hardcoded historical approval date cannot be used in future releases");
});
