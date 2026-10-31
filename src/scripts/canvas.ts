import { createCanvasWorld, stepCanvasWorld, normalizeParticleCount, DEFAULT_SEED } from "../domain/canvas";
import type { CanvasWorld } from "../domain/canvas";

const canvas = document.querySelector<HTMLCanvasElement>("[data-canvas-stage]");
const staticArt = document.querySelector<SVGSVGElement>("[data-canvas-static]");
const count = document.querySelector<HTMLSelectElement>("[data-canvas-count]");
const toggle = document.querySelector<HTMLButtonElement>("[data-canvas-toggle]");
const reset = document.querySelector<HTMLButtonElement>("[data-canvas-reset]");
const status = document.querySelector<HTMLElement>("[data-canvas-status]");
const help = document.querySelector<HTMLElement>("[data-canvas-help]");

if (canvas && staticArt && count && toggle && reset && status && help) {
  const context = canvas.getContext("2d");
  if (!context) {
    status.textContent = "Canvas2D unavailable. The static illustration remains visible.";
  } else {
    // Capture narrowed values for event handlers and the animation callback.
    const stage: HTMLCanvasElement = canvas;
    const staticPreview: SVGSVGElement = staticArt;
    const ctx: CanvasRenderingContext2D = context;
    const countSelect: HTMLSelectElement = count;
    const playButton: HTMLButtonElement = toggle;
    const resetButton: HTMLButtonElement = reset;
    const liveStatus: HTMLElement = status;
    const fallbackHelp: HTMLElement = help;

    let world: CanvasWorld = createCanvasWorld(DEFAULT_SEED, 24);
    let playing = false;
    let frameId: number | null = null;
    let lastTime: number | null = null;
    let stepCount = 0;
    let disposed = false;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    function draw(): void {
      const { width, height } = world;
      ctx.fillStyle = "#e4efea";
      ctx.fillRect(0, 0, width, height);
      ctx.strokeStyle = "#b8d3c9";
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 60; x < width; x += 60) { ctx.moveTo(x, 0); ctx.lineTo(x, height); }
      for (let y = 60; y < height; y += 60) { ctx.moveTo(0, y); ctx.lineTo(width, y); }
      ctx.stroke();
      for (const particle of world.particles) {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = "#146b67";
        ctx.fill();
      }
    }

    function label(message: string): void {
      liveStatus.textContent = message;
      playButton.textContent = playing ? "Pause simulation" : "Play simulation";
      stage.dataset.simulationState = playing ? "running" : "paused";
    }

    function stop(message: string): void {
      playing = false;
      if (frameId !== null) cancelAnimationFrame(frameId);
      frameId = null;
      lastTime = null;
      label(message);
    }

    function animate(timestamp: number): void {
      frameId = null;
      if (!playing || disposed || document.hidden) {
        if (document.hidden && playing) stop("Paused · tab hidden. Press Play to resume.");
        return;
      }
      const delta = lastTime === null ? 0 : Math.max(0, timestamp - lastTime);
      lastTime = timestamp;
      if (delta > 0) {
        world = stepCanvasWorld(world, delta);
        stepCount += 1;
        stage.dataset.stepCount = String(stepCount);
        draw();
      }
      frameId = requestAnimationFrame(animate);
    }

    function resetWorld(message: string): void {
      stop(message);
      world = createCanvasWorld(DEFAULT_SEED, normalizeParticleCount(Number(countSelect.value)), world.width, world.height);
      stepCount = 0;
      stage.dataset.stepCount = "0";
      draw();
    }

    function fitCanvas(): void {
      if (disposed) return;
      const rect = stage.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) return;
      // Limit backing pixels even when the device reports an extreme DPR.
      const dpr = Math.min(2, Math.max(1, window.devicePixelRatio || 1));
      const pixelWidth = Math.max(1, Math.round(rect.width * dpr));
      const pixelHeight = Math.max(1, Math.round(rect.height * dpr));
      if (stage.width === pixelWidth && stage.height === pixelHeight) return;
      stop("Paused · canvas resized. Press Play to continue.");
      stage.width = pixelWidth;
      stage.height = pixelHeight;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      world = createCanvasWorld(DEFAULT_SEED, normalizeParticleCount(Number(countSelect.value)), Math.round(rect.width), Math.round(rect.height));
      stepCount = 0;
      stage.dataset.stepCount = "0";
      draw();
    }

    stage.hidden = false;
    staticPreview.hidden = true;
    countSelect.disabled = false;
    playButton.disabled = false;
    resetButton.disabled = false;
    fallbackHelp.hidden = true;
    stage.dataset.stepCount = "0";
    label(reducedMotion.matches ? "Paused · reduced motion is preferred. Press Play to start explicitly." : "Paused · press Play to start.");
    fitCanvas();

    playButton.addEventListener("click", () => {
      if (playing) { stop("Paused · press Play to continue."); return; }
      if (document.hidden) { stop("Paused · tab hidden. Return to this tab to play."); return; }
      playing = true;
      lastTime = null;
      label("Running · press Pause to stop.");
      frameId = requestAnimationFrame(animate);
    });
    resetButton.addEventListener("click", () => resetWorld("Paused · reset to seed 42."));
    countSelect.addEventListener("change", () => resetWorld("Paused · particle count updated and seed reset."));
    document.addEventListener("visibilitychange", () => {
      if (document.hidden && playing) stop("Paused · tab hidden. Press Play to resume.");
    });
    reducedMotion.addEventListener("change", () => {
      if (reducedMotion.matches) stop("Paused · reduced-motion preference enabled.");
    });
    const observer = new ResizeObserver(fitCanvas);
    observer.observe(stage);

    window.addEventListener("pagehide", () => {
      disposed = true;
      stop("Paused · page unloaded.");
      observer.disconnect();
    }, { once: true });
  }
}
