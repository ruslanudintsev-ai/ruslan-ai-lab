import assert from "node:assert/strict";
import test from "node:test";
import { normalizeBasePath } from "../../scripts/paths.mjs";

test("project path normalization supports both root and nested deployments", () => {
  assert.equal(normalizeBasePath("/"), "/");
  assert.equal(normalizeBasePath("/ruslan-ai-lab"), "/ruslan-ai-lab/");
  assert.equal(normalizeBasePath("/ruslan-ai-lab/"), "/ruslan-ai-lab/");
});

test("reject malformed and remote base values", () => {
  for (const val of ["", "https://example.org/", "//example/", "/a/../", "/a?x=1", 3]) {
    assert.throws(() => normalizeBasePath(val));
  }
});
