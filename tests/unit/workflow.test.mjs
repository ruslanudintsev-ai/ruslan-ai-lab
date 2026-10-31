import assert from "node:assert/strict";
import test from "node:test";
import { INITIAL_WORKFLOW, WORKFLOW_STEPS, WORKFLOW_COPY, transitionWorkflow, canAdvance } from "../../src/domain/workflow.ts";

const next = state => transitionWorkflow(state, "next");

test("pipeline steps are finite and cover issue to release with truthful educational copy", () => {
  assert.deepEqual(WORKFLOW_STEPS, ["issue", "agent", "pull-request", "ci", "review", "release"]);
  for (const step of WORKFLOW_STEPS) {
    assert.ok(WORKFLOW_COPY[step].title);
    assert.ok(WORKFLOW_COPY[step].actor);
    assert.ok(WORKFLOW_COPY[step].explanation);
  }
  assert.match(WORKFLOW_COPY.release.explanation, /No website is published/);
});

test("initial state and transition sequence stop at undecided CI", () => {
  let state = { ...INITIAL_WORKFLOW };
  assert.deepEqual(state, { step: "issue", ci: "pending", revision: 0, ownerApproved: false });
  assert.equal(next(state).step, "agent");
  state = next(next(next(state)));
  assert.equal(state.step, "ci");
  assert.equal(canAdvance(state), false);
  assert.deepEqual(next(state), state);
});

test("explicit CI PASS leads to review, but release requires explicit simulated owner approval", () => {
  let state = INITIAL_WORKFLOW;
  for (let i = 0; i < 3; i++) state = next(state);
  state = transitionWorkflow(state, "ci-pass");
  assert.equal(state.ci, "passed");
  state = next(state);
  assert.equal(state.step, "review");
  assert.equal(canAdvance(state), false);
  assert.equal(next(state).step, "review");
  state = transitionWorkflow(state, "owner-approve");
  assert.equal(state.ownerApproved, true);
  state = next(state);
  assert.equal(state.step, "release");
  assert.deepEqual(next(state), state);
});

test("CI FAIL returns to agent draft and requires a fresh check on revision", () => {
  let state = INITIAL_WORKFLOW;
  for (let i = 0; i < 3; i++) state = next(state);
  state = transitionWorkflow(state, "ci-fail");
  assert.equal(state.ci, "failed");
  assert.equal(next(state).step, "agent");
  state = next(state);
  assert.equal(state.revision, 1);
  assert.equal(state.ci, "pending");
  assert.equal(next(next(state)).step, "ci");
  assert.equal(canAdvance(next(next(state))), false);
});

test("owner approval is a guarded demo action, never available from earlier states", () => {
  assert.deepEqual(transitionWorkflow(INITIAL_WORKFLOW, "owner-approve"), INITIAL_WORKFLOW);
  assert.deepEqual(transitionWorkflow(INITIAL_WORKFLOW, "ci-pass"), INITIAL_WORKFLOW);
  assert.deepEqual(transitionWorkflow(INITIAL_WORKFLOW, "ci-fail"), INITIAL_WORKFLOW);
});

test("previous and reset are bounded, deterministic and do not mutate caller state", () => {
  const initial = structuredClone(INITIAL_WORKFLOW);
  assert.deepEqual(transitionWorkflow(initial, "previous"), initial);
  let state = next(next(initial));
  const snapshot = structuredClone(state);
  assert.equal(transitionWorkflow(state, "previous").step, "agent");
  assert.deepEqual(state, snapshot);
  assert.deepEqual(transitionWorkflow(state, "reset"), INITIAL_WORKFLOW);
  assert.deepEqual(initial, INITIAL_WORKFLOW);
});

test("malformed state cannot bypass release gate or inject arbitrary steps", () => {
  const input = { step: "release", ci: "pending", ownerApproved: true, revision: Infinity };
  assert.deepEqual(transitionWorkflow(input, "next"), {
    step: "review", ci: "passed", revision: 0, ownerApproved: false
  });
  const dangerous = transitionWorkflow({ step: "<script>", ci: "passed", revision: -1, ownerApproved: true }, "next");
  assert.deepEqual(dangerous, { step: "agent", ci: "passed", revision: 0, ownerApproved: false });
});

test("replaying identical action sequence produces identical states", () => {
  const seq = ["next","next","next","ci-fail","next","next","next","ci-pass","next","owner-approve","next"];
  const run = () => seq.reduce(transitionWorkflow, INITIAL_WORKFLOW);
  assert.deepEqual(run(), run());
  assert.equal(run().step, "release");
  assert.equal(run().revision, 1);
});
