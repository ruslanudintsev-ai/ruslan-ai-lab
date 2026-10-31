import { DEFAULT_3D, normalize3D, clampElapsed, shouldDraw } from "../domain/playground3d";
import type { Settings3D } from "../domain/playground3d";
import type { Scene3D } from "./webgl-scene";

const root = document.querySelector<HTMLElement>("[data-3d-lab]");
const enable = root?.querySelector<HTMLButtonElement>("[data-3d-enable]");
const canvas = root?.querySelector<HTMLCanvasElement>("[data-3d-canvas]");
const staticArt = root?.querySelector<SVGSVGElement>("[data-3d-static]");
const stage = root?.querySelector<HTMLElement>("[data-3d-stage]");
const material = root?.querySelector<HTMLSelectElement>("[data-3d-material]");
const light = root?.querySelector<HTMLSelectElement>("[data-3d-light]");
const camera = root?.querySelector<HTMLSelectElement>("[data-3d-camera]");
const toggle = root?.querySelector<HTMLButtonElement>("[data-3d-toggle]");
const reset = root?.querySelector<HTMLButtonElement>("[data-3d-reset]");
const status = root?.querySelector<HTMLElement>("[data-3d-status]");

if (root && enable && canvas && staticArt && stage && material && light && camera && toggle && reset && status) {
  const surface = root, activate = enable, view = canvas, fallback = staticArt, frame = stage;
  const materialSelect = material, lightSelect = light, cameraSelect = camera;
  const playButton = toggle, resetButton = reset, message = status;
  let scene: Scene3D | null = null;
  let gl: WebGLRenderingContext | null = null;
  let settings: Settings3D = { ...DEFAULT_3D };
  let rotation = 0, playing = false, scheduled: number | null = null, lastDraw: number | null = null;
  let enabling = false, offscreen = false;
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const observeResize = new ResizeObserver(() => {
    if (!scene) return;
    const rect = frame.getBoundingClientRect();
    scene.resize(rect.width, rect.height, window.devicePixelRatio);
    scene.draw(settings, rotation);
  });
  const observeVisible = new IntersectionObserver(entries => {
    offscreen = entries[0]?.isIntersecting === false;
    if (offscreen && playing) pause("Paused because the 3D scene is offscreen.");
  });

  function label(text: string): void {
    message.textContent = text;
    playButton.textContent = playing ? "Pause rotation" : "Play rotation";
    surface.dataset.renderState = scene ? (playing ? "running" : "paused") : "static";
    view.dataset.frameCount ??= "0";
  }
  function pause(text: string): void {
    playing = false;
    if (scheduled !== null) cancelAnimationFrame(scheduled);
    scheduled = null;
    lastDraw = null;
    label(text);
  }
  function loop(time: number): void {
    scheduled = null;
    if (!playing || !scene || document.hidden || offscreen) {
      if (playing) pause("Paused because the scene is not visible.");
      return;
    }
    if (shouldDraw(time,lastDraw)) {
      const elapsed = lastDraw === null ? 0 : clampElapsed(time - lastDraw);
      rotation += elapsed * 0.00065;
      lastDraw = time;
      scene.draw(settings, rotation);
      view.dataset.frameCount = String(Number(view.dataset.frameCount ?? "0") + 1);
    }
    scheduled = requestAnimationFrame(loop);
  }
  function disableScene(text: string): void {
    pause(text);
    observeResize.disconnect();
    observeVisible.disconnect();
    scene?.dispose();
    scene = null;
    gl = null;
    view.hidden = true;
    fallback.removeAttribute("hidden");
    materialSelect.disabled = true; lightSelect.disabled = true; cameraSelect.disabled = true;
    playButton.disabled = true; resetButton.disabled = true;
    activate.disabled = false;
    activate.textContent = "Enable 3D";
    label(text);
  }
  async function initialize(): Promise<void> {
    if (scene || enabling || document.hidden) return;
    enabling = true;
    activate.disabled = true;
    label("Preparing optional WebGL scene…");
    try {
      // Source is split and loaded only after the user's explicit activation.
      const { createScene } = await import("./webgl-scene");
      const context = view.getContext("webgl", { alpha: false, antialias: false, preserveDrawingBuffer: false, powerPreference: "low-power" });
      if (!context) throw new Error("WebGL is unavailable");
      gl = context;
      scene = createScene(view,context);
      const rect = frame.getBoundingClientRect();
      scene.resize(rect.width,rect.height,window.devicePixelRatio);
      view.dataset.frameCount = "0";
      view.hidden = false;
      fallback.setAttribute("hidden","");
      materialSelect.disabled = false; lightSelect.disabled = false; cameraSelect.disabled = false;
      playButton.disabled = false; resetButton.disabled = false;
      activate.textContent = "3D enabled";
      activate.disabled = true;
      observeResize.observe(frame);
      observeVisible.observe(frame);
      scene.draw(settings,rotation);
      label(motion.matches ? "3D enabled · paused for reduced motion. Play only when you choose." : "3D enabled · paused. Select Play to rotate.");
    } catch {
      disableScene("WebGL unavailable or initialization failed. Static illustration remains available.");
      activate.disabled = true;
    } finally {
      enabling = false;
    }
  }
  function resetScene(): void {
    if (!scene) return;
    pause("Scene reset. Animation paused.");
    settings = { ...DEFAULT_3D };
    materialSelect.value = settings.material;
    lightSelect.value = settings.light;
    cameraSelect.value = settings.camera;
    rotation = 0; view.dataset.frameCount = "0";
    scene.draw(settings,rotation);
  }
  activate.disabled = false;
  activate.addEventListener("click", () => { void initialize(); });
  playButton.addEventListener("click", () => {
    if (!scene) return;
    if (playing) { pause("Rotation paused."); return; }
    if (document.hidden || offscreen) { pause("Scene not visible. Cannot start rotation."); return; }
    playing = true; lastDraw = null;
    label("Rotation running, at most 30 drawn frames per second.");
    scheduled = requestAnimationFrame(loop);
  });
  resetButton.addEventListener("click",resetScene);
  for (const control of [materialSelect,lightSelect,cameraSelect]) {
    control.addEventListener("change", () => {
      if (!scene) return;
      settings = normalize3D({ material: materialSelect.value, light: lightSelect.value, camera: cameraSelect.value });
      scene.draw(settings,rotation);
      label("Material, light or camera updated locally.");
    });
  }
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && playing) pause("Paused because the tab is hidden.");
  });
  motion.addEventListener("change", () => {
    if (motion.matches && playing) pause("Paused because reduced motion was requested.");
  });
  view.addEventListener("webglcontextlost", event => {
    event.preventDefault();
    disableScene("Graphics context lost. Static illustration restored; enable again after recovery.");
    activate.disabled = true;
  });
  view.addEventListener("webglcontextrestored", () => {
    label("Graphics context restored. Enable 3D again if desired.");
    activate.disabled = false;
  });
  window.addEventListener("pagehide", () => {
    const previous = gl;
    disableScene("GPU resources released because page was left.");
    previous?.getExtension("WEBGL_lose_context")?.loseContext();
  });
  window.addEventListener("pageshow", () => {
    activate.disabled = false;
    label("Static preview ready. Enable 3D to start a new scene.");
  });
}
