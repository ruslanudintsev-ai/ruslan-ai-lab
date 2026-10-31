/** Bounded, pure controls and frame-budget math for the opt-in 3D lab. */
export type MaterialName = "teal" | "amber" | "slate";
export type LightName = "left" | "front" | "right";
export type CameraName = "wide" | "near" | "far";
export type Settings3D = Readonly<{ material: MaterialName; light: LightName; camera: CameraName }>;
export const DEFAULT_3D: Settings3D = { material: "teal", light: "front", camera: "wide" };
export const MATERIALS: Readonly<Record<MaterialName, readonly [number,number,number]>> = {
  teal: [0.08, 0.42, 0.40], amber: [0.78, 0.42, 0.17], slate: [0.28, 0.37, 0.51]
};
export const LIGHTS: Readonly<Record<LightName, readonly [number,number,number]>> = {
  left: [-0.8, 0.5, 1], front: [0.35, 0.65, 1], right: [0.8, 0.5, 1]
};
export const CAMERAS: Readonly<Record<CameraName, number>> = {
  wide: 4.8, near: 3.6, far: 6.4
};
export function normalize3D(input: unknown): Settings3D {
  const obj = input && typeof input === "object" ? input as Record<string,unknown> : {};
  return {
    material: obj.material === "amber" || obj.material === "slate" ? obj.material : "teal",
    light: obj.light === "left" || obj.light === "right" ? obj.light : "front",
    camera: obj.camera === "near" || obj.camera === "far" ? obj.camera : "wide"
  };
}
export function renderDimensions(width: unknown, height: unknown, dpr: unknown): Readonly<{ width: number; height: number; scale: number }> {
  const safe = (n: unknown, fallback: number) => typeof n === "number" && Number.isFinite(n) && n > 0 ? n : fallback;
  const w = Math.max(1, Math.min(1440, Math.round(safe(width, 720))));
  const h = Math.max(1, Math.min(900, Math.round(safe(height, 405))));
  const scale = Math.max(1, Math.min(2, safe(dpr, 1)));
  return { width: Math.round(w * scale), height: Math.round(h * scale), scale };
}
/** Limit drawing to 30 FPS; suspended tabs never accumulate catch-up frames. */
export function shouldDraw(now: number, lastFrame: number | null): boolean {
  return Number.isFinite(now) && (lastFrame === null || now - lastFrame >= 1000 / 30 - 0.1);
}
export function clampElapsed(ms: unknown): number {
  return typeof ms === "number" && Number.isFinite(ms) ? Math.max(0, Math.min(ms, 50)) : 0;
}
