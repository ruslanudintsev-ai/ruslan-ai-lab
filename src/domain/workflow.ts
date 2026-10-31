/**
 * Educational simulation only. This file does not run AI agents, submit PRs,
 * access GitHub, or authorize a deployment. Every transition is local.
 */
export const WORKFLOW_STEPS = ["issue", "agent", "pull-request", "ci", "review", "release"] as const;
export type WorkflowStep = (typeof WORKFLOW_STEPS)[number];
export type CiOutcome = "pending" | "passed" | "failed";
export type WorkflowState = Readonly<{
  step: WorkflowStep;
  ci: CiOutcome;
  revision: number;
  ownerApproved: boolean;
}>;

export type WorkflowAction =
  | "next" | "previous" | "reset"
  | "ci-pass" | "ci-fail" | "owner-approve";

export const INITIAL_WORKFLOW: WorkflowState = {
  step: "issue", ci: "pending", revision: 0, ownerApproved: false
};

export const WORKFLOW_COPY: Readonly<Record<WorkflowStep, Readonly<{
  title: string; actor: string; explanation: string; output: string;
}>>> = {
  issue: {
    title: "Define the issue", actor: "Owner",
    explanation: "The owner defines a bounded goal, acceptance criteria and the rule that nothing publishes automatically.",
    output: "A scoped, reviewable task"
  },
  agent: {
    title: "Prepare a draft", actor: "Simulated AI agent",
    explanation: "A hypothetical agent proposes a code change. No model is running in this demonstration.",
    output: "A proposed patch, not a deployed feature"
  },
  "pull-request": {
    title: "Open a pull request", actor: "Engineer and owner",
    explanation: "The hypothetical changes are exposed as a reviewable diff with tests and a clear source revision.",
    output: "An inspectable draft PR"
  },
  ci: {
    title: "Inspect CI checks", actor: "Automated test suite (simulated)",
    explanation: "Choose a demo result. A failure returns to the draft stage; a pass can proceed to review. These are not live CI metrics.",
    output: "A simulated PASS or FAIL"
  },
  review: {
    title: "Review the evidence", actor: "Owner",
    explanation: "The owner examines the patch, known risks and test evidence. Only an explicit simulated owner decision opens the release step.",
    output: "An owner-controlled decision"
  },
  release: {
    title: "Record release decision", actor: "Owner",
    explanation: "This represents a decision in the demo only. No website is published, no API is called and no GitHub action is triggered.",
    output: "Simulated authorization; no actual deployment"
  }
};

function isStep(input: unknown): input is WorkflowStep {
  return typeof input === "string" && (WORKFLOW_STEPS as readonly string[]).includes(input);
}

function normalize(input: unknown): WorkflowState {
  if (typeof input !== "object" || input === null) return INITIAL_WORKFLOW;
  const source = input as Record<string, unknown>;
  const step = isStep(source.step) ? source.step : "issue";
  const ci: CiOutcome = source.ci === "passed" || source.ci === "failed" ? source.ci : "pending";
  const revision = typeof source.revision === "number" && Number.isInteger(source.revision) && source.revision >= 0 && source.revision <= 20
    ? source.revision : 0;
  const ownerApproved = source.ownerApproved === true && (step === "review" || step === "release") && ci === "passed";
  // A hypothetical "release" state is invalid unless the simulated owner approved.
  if (step === "release" && !ownerApproved) return { step: "review", ci: "passed", revision, ownerApproved: false };
  return { step, ci, revision, ownerApproved };
}

export function canAdvance(input: unknown): boolean {
  const state = normalize(input);
  if (state.step === "ci") return state.ci !== "pending";
  if (state.step === "review") return state.ownerApproved;
  return state.step !== "release";
}

export function transitionWorkflow(input: unknown, action: WorkflowAction): WorkflowState {
  const state = normalize(input);
  if (action === "reset") return { ...INITIAL_WORKFLOW };
  if (action === "ci-pass" || action === "ci-fail") {
    return state.step === "ci"
      ? { ...state, ci: action === "ci-pass" ? "passed" : "failed", ownerApproved: false }
      : state;
  }
  if (action === "owner-approve") {
    return state.step === "review" && state.ci === "passed"
      ? { ...state, ownerApproved: true }
      : state;
  }
  const index = WORKFLOW_STEPS.indexOf(state.step);
  if (action === "previous") {
    if (index === 0) return state;
    const previous = WORKFLOW_STEPS[index - 1];
    // A review may be revisited; explicit owner approval must be made again.
    return { ...state, step: previous, ownerApproved: false };
  }
  if (action !== "next" || !canAdvance(state)) return state;
  if (state.step === "ci" && state.ci === "failed") {
    return { step: "agent", ci: "pending", revision: Math.min(state.revision + 1, 20), ownerApproved: false };
  }
  if (index >= WORKFLOW_STEPS.length - 1) return state;
  const next = WORKFLOW_STEPS[index + 1];
  return { ...state, step: next };
}
