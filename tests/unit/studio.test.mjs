import assert from "node:assert/strict";
import test from "node:test";
import { ACCENTS, DEFAULT_STATE, generateCss, normalizeStudioState } from "../../src/domain/studio.ts";

test("default CSS is deterministic and includes reduced-motion fallback", () => {
  const a = generateCss(DEFAULT_STATE);
  assert.equal(a, generateCss({ ...DEFAULT_STATE }));
  assert.match(a, /--studio-accent: #146B67;/);
  assert.match(a, /prefers-reduced-motion: reduce/);
  assert.match(a, /grid-template-columns: repeat/);
});

test("finite state clamps injected CSS and invalid numbers to defaults", () => {
  const unsafe = { accent: "red; background: url(https://example.org)", radiusPx: 999, columns: -1, gapPx: NaN, motion: "blink" };
  assert.deepEqual(normalizeStudioState(unsafe), DEFAULT_STATE);
  assert.doesNotMatch(generateCss(unsafe), /https:|url\(|blink|999/);
});

test("each approved accent is reflected in emitted CSS", () => {
  for (const option of ACCENTS) assert.ok(generateCss({ ...DEFAULT_STATE, accent: option.value }).includes("--studio-accent: " + option.value));
});

test("columns, gap, radius and motion are all reflected", () => {
  const css = generateCss({ accent: "#8054B2", radiusPx: 24, columns: 3, gapPx: 32, motion: "subtle" });
  assert.ok(css.includes("--studio-radius: 24px;"));
  assert.ok(css.includes("--studio-gap: 32px;"));
  assert.ok(css.includes("--studio-columns: 3;"));
  assert.ok(css.includes("--studio-duration: 160ms;"));
});

test("unexpected fields are ignored", () => {
  assert.equal(generateCss({ ...DEFAULT_STATE, extra: "<script>" }), generateCss(DEFAULT_STATE));
});
