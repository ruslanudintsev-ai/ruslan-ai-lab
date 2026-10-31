import assert from "node:assert/strict";
import test from "node:test";
import { DEFAULT_BOARD, moveBoardItem, dropBoardItemBefore, normalizeBoard, serializeBoard, parseSavedBoard, STORAGE_KEY } from "../../src/domain/browser-apis.ts";

test("board has a fixed, non-personal whitelist and a versioned local key", () => {
  assert.deepEqual(DEFAULT_BOARD, ["inspect", "build", "verify"]);
  assert.match(STORAGE_KEY, /:v1$/);
  assert.deepEqual(normalizeBoard(["verify", "inspect", "build"]), ["verify", "inspect", "build"]);
});

test("move up/down preserves permutation, respects boundaries and never mutates caller", () => {
  const original = [...DEFAULT_BOARD];
  assert.deepEqual(moveBoardItem(original, "build", "up"), ["build", "inspect", "verify"]);
  assert.deepEqual(moveBoardItem(original, "build", "down"), ["inspect", "verify", "build"]);
  assert.deepEqual(moveBoardItem(original, "inspect", "up"), original);
  assert.deepEqual(moveBoardItem(original, "verify", "down"), original);
  assert.deepEqual(original, [...DEFAULT_BOARD]);
});

test("drag before target is deterministic and guarded", () => {
  assert.deepEqual(dropBoardItemBefore(DEFAULT_BOARD, "verify", "inspect"), ["verify", "inspect", "build"]);
  assert.deepEqual(dropBoardItemBefore(DEFAULT_BOARD, "inspect", "verify"), ["build", "inspect", "verify"]);
  assert.deepEqual(dropBoardItemBefore(DEFAULT_BOARD, "inspect", "inspect"), [...DEFAULT_BOARD]);
  assert.deepEqual(dropBoardItemBefore(DEFAULT_BOARD, "script", "inspect"), [...DEFAULT_BOARD]);
  assert.deepEqual(dropBoardItemBefore(DEFAULT_BOARD, "build", "other"), [...DEFAULT_BOARD]);
});

test("invalid, duplicated, extra, missing or non-string values never escape whitelist", () => {
  for (const value of [null, {}, [], ["inspect", "inspect", "verify"], ["inspect", "build", "<script>"], ["inspect", "build", "verify", "x"]]) {
    assert.deepEqual(normalizeBoard(value), [...DEFAULT_BOARD]);
  }
});

test("versioned serialization round trips, but malformed stored input is rejected", () => {
  const permutation = ["verify", "build", "inspect"];
  const saved = serializeBoard(permutation);
  assert.deepEqual(parseSavedBoard(saved), permutation);
  for (const raw of [null, "", "bad", JSON.stringify({ version: 2, order: permutation }),
    JSON.stringify({ version: 1, order: ["inspect", "inspect", "build"] }),
    JSON.stringify({ version: 1, order: [...permutation, "extra"] }), "x".repeat(300)]) {
    assert.equal(parseSavedBoard(raw), null);
  }
});
