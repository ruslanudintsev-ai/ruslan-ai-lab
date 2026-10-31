import {
  WORKFLOW_STEPS,
  WORKFLOW_COPY,
  INITIAL_WORKFLOW,
  transitionWorkflow,
  canAdvance
} from "../domain/workflow";
import type { WorkflowState, WorkflowAction } from "../domain/workflow";

const root = document.querySelector<HTMLElement>("[data-workflow]");
const next = root?.querySelector<HTMLButtonElement>("[data-workflow-next]");
const previous = root?.querySelector<HTMLButtonElement>("[data-workflow-previous]");
const reset = root?.querySelector<HTMLButtonElement>("[data-workflow-reset]");
const fail = root?.querySelector<HTMLButtonElement>("[data-workflow-fail]");
const pass = root?.querySelector<HTMLButtonElement>("[data-workflow-pass]");
const approve = root?.querySelector<HTMLButtonElement>("[data-workflow-approve]");
const ciPanel = root?.querySelector<HTMLElement>("[data-workflow-ci-panel]");
const ownerPanel = root?.querySelector<HTMLElement>("[data-workflow-owner-panel]");
const heading = root?.querySelector<HTMLElement>("[data-workflow-heading]");
const actor = root?.querySelector<HTMLElement>("[data-workflow-actor]");
const explanation = root?.querySelector<HTMLElement>("[data-workflow-explanation]");
const output = root?.querySelector<HTMLElement>("[data-workflow-output]");
const revision = root?.querySelector<HTMLElement>("[data-workflow-revision]");
const status = root?.querySelector<HTMLElement>("[data-workflow-status]");
const help = root?.querySelector<HTMLElement>("[data-workflow-help]");
const stepItems = root?.querySelectorAll<HTMLElement>("[data-workflow-step]");

if (root && next && previous && reset && fail && pass && approve && ciPanel && ownerPanel &&
    heading && actor && explanation && output && revision && status && help && stepItems) {
  const surface = root;
  const detailHeading = heading;
  const detailActor = actor;
  const detailExplanation = explanation;
  const detailOutput = output;
  const detailRevision = revision;
  const message = status;
  let state: WorkflowState = { ...INITIAL_WORKFLOW };

  function announce(action: WorkflowAction | "initialize"): string {
    if (state.step === "release") return "Simulated release decision recorded. Nothing was published or merged.";
    if (state.step === "review" && state.ownerApproved) return "Owner approval simulated. You can now advance to the demo release decision.";
    if (state.step === "ci" && state.ci === "failed") return "Simulated CI failed. Next step returns to draft revision " + (state.revision + 1) + ".";
    if (state.step === "ci" && state.ci === "passed") return "Simulated CI passed. Next step is owner review.";
    if (state.step === "ci") return "CI step. Choose a simulated PASS or FAIL to continue.";
    if (action === "reset") return "Simulation reset to Issue. No repository was changed.";
    return WORKFLOW_COPY[state.step].title + " · " + WORKFLOW_COPY[state.step].actor + ". Educational simulation only.";
  }

  function render(action: WorkflowAction | "initialize"): void {
    const copy = WORKFLOW_COPY[state.step];
    surface.dataset.step = state.step;
    surface.dataset.ci = state.ci;
    surface.dataset.revision = String(state.revision);
    surface.dataset.approved = String(state.ownerApproved);
    detailHeading.textContent = copy.title;
    detailActor.textContent = copy.actor;
    detailExplanation.textContent = copy.explanation;
    detailOutput.textContent = copy.output;
    detailRevision.textContent = "REVISION " + state.revision;
    message.textContent = announce(action);
    stepItems.forEach(item => {
      if (item.dataset.workflowStep === state.step) item.setAttribute("aria-current", "step");
      else item.removeAttribute("aria-current");
    });
    previous.disabled = state.step === WORKFLOW_STEPS[0];
    next.disabled = !canAdvance(state);
    reset.disabled = false;
    ciPanel.hidden = state.step !== "ci";
    ownerPanel.hidden = state.step !== "review";
    fail.disabled = state.step !== "ci";
    pass.disabled = state.step !== "ci";
    approve.disabled = state.step !== "review" || state.ci !== "passed" || state.ownerApproved;
  }

  function dispatch(action: WorkflowAction): void {
    state = transitionWorkflow(state, action);
    render(action);
  }

  next.addEventListener("click", () => dispatch("next"));
  previous.addEventListener("click", () => dispatch("previous"));
  reset.addEventListener("click", () => dispatch("reset"));
  fail.addEventListener("click", () => dispatch("ci-fail"));
  pass.addEventListener("click", () => dispatch("ci-pass"));
  approve.addEventListener("click", () => dispatch("owner-approve"));
  help.hidden = true;
  render("initialize");
}
