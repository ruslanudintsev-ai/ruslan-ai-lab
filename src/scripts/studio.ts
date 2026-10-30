import { DEFAULT_STATE, generateCss, normalizeStudioState } from "../domain/studio";
import type { StudioState } from "../domain/studio";

const form = document.querySelector<HTMLFormElement>("[data-studio-form]");
const preview = document.querySelector<HTMLElement>("[data-studio-preview]");
const code = document.querySelector<HTMLTextAreaElement>("[data-studio-code]");
const reset = document.querySelector<HTMLButtonElement>("[data-reset]");
const copy = document.querySelector<HTMLButtonElement>("[data-copy]");
const status = document.querySelector<HTMLElement>("[data-copy-status]");
const help = document.querySelector<HTMLElement>("[data-studio-help]");

if (form && preview && code && reset && copy && status && help) {
  const controls = {
    accent: form.elements.namedItem("accent") as HTMLSelectElement,
    radiusPx: form.elements.namedItem("radiusPx") as HTMLSelectElement,
    columns: form.elements.namedItem("columns") as HTMLSelectElement,
    gapPx: form.elements.namedItem("gapPx") as HTMLSelectElement,
    motion: form.elements.namedItem("motion") as HTMLSelectElement
  };

  function readState(): StudioState {
    return normalizeStudioState({
      accent: controls.accent.value,
      radiusPx: Number(controls.radiusPx.value),
      columns: Number(controls.columns.value),
      gapPx: Number(controls.gapPx.value),
      motion: controls.motion.value
    });
  }

  function render(state: StudioState): void {
    const css = generateCss(state);
    preview.style.setProperty("--studio-accent", state.accent);
    preview.style.setProperty("--studio-radius", state.radiusPx + "px");
    preview.style.setProperty("--studio-gap", state.gapPx + "px");
    preview.style.setProperty("--studio-columns", String(state.columns));
    preview.style.setProperty("--studio-duration", state.motion === "subtle" ? "160ms" : "0ms");
    code.value = css;
    status.textContent = "";
  }

  for (const element of Object.values(controls)) {
    element.addEventListener("change", () => render(readState()));
  }
  reset.addEventListener("click", () => {
    controls.accent.value = DEFAULT_STATE.accent;
    controls.radiusPx.value = String(DEFAULT_STATE.radiusPx);
    controls.columns.value = String(DEFAULT_STATE.columns);
    controls.gapPx.value = String(DEFAULT_STATE.gapPx);
    controls.motion.value = DEFAULT_STATE.motion;
    render(DEFAULT_STATE);
  });

  copy.addEventListener("click", async () => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard API unavailable");
      await navigator.clipboard.writeText(code.value);
      status.textContent = "CSS copied to clipboard.";
    } catch {
      code.focus();
      code.select();
      status.textContent = "Clipboard unavailable. CSS is selected: use your device's Copy command.";
    }
  });
  help.hidden = true;
  render(DEFAULT_STATE);
}
