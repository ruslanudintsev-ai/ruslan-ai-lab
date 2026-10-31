/**
 * Canvas Lab P2 — pure deterministic particle simulation.
 * Nothing here starts animation, reads browser state, or allocates a canvas.
 * UI/lifecycle/reduced-motion features are a separate acceptance slice.
 */
export const DEFAULT_SEED = 42;
export const MIN_PARTICLES = 12;
export const MAX_PARTICLES = 60;

export type Particle = Readonly<{
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}>;

export type CanvasWorld = Readonly<{
  seed: number;
  width: number;
  height: number;
  particles: ReadonlyArray<Particle>;
}>;

function safeNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.max(minimum, Math.min(maximum, value));
}

export function normalizeSeed(value: unknown): number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= 0xffffffff
    ? value >>> 0
    : DEFAULT_SEED;
}

export function normalizeParticleCount(value: unknown): number {
  return clamp(Math.round(safeNumber(value, 24)), MIN_PARTICLES, MAX_PARTICLES);
}

/** Small self-contained PRNG, not Math.random(). Same input seed => same particles. */
function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6D2B79F5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createCanvasWorld(
  seed: unknown = DEFAULT_SEED,
  count: unknown = 24,
  width: unknown = 680,
  height: unknown = 360
): CanvasWorld {
  const normalizedSeed = normalizeSeed(seed);
  const particleCount = normalizeParticleCount(count);
  const w = clamp(Math.round(safeNumber(width, 680)), 160, 1600);
  const h = clamp(Math.round(safeNumber(height, 360)), 120, 900);
  const random = seededRandom(normalizedSeed);
  const particles: Particle[] = [];
  for (let index = 0; index < particleCount; index += 1) {
    const radius = 4 + random() * 3;
    particles.push({
      x: radius + random() * (w - 2 * radius),
      y: radius + random() * (h - 2 * radius),
      vx: (random() - 0.5) * 1.8,
      vy: (random() - 0.5) * 1.8,
      radius
    });
  }
  return { seed: normalizedSeed, width: w, height: h, particles };
}

/** One bounded simulation step. The caller owns scheduling and pause/resume. */
export function stepCanvasWorld(world: CanvasWorld, deltaMs: number): CanvasWorld {
  const safeDelta = safeNumber(deltaMs, 0);
  const ticks = clamp(safeDelta / (1000 / 60), 0, 2);
  const particles: Particle[] = world.particles.map(particle => {
    const left = particle.radius;
    const right = world.width - particle.radius;
    const top = particle.radius;
    const bottom = world.height - particle.radius;
    let x = particle.x + particle.vx * ticks;
    let y = particle.y + particle.vy * ticks;
    let vx = particle.vx;
    let vy = particle.vy;

    if (x < left) {
      x = left;
      vx = Math.abs(vx);
    } else if (x > right) {
      x = right;
      vx = -Math.abs(vx);
    }
    if (y < top) {
      y = top;
      vy = Math.abs(vy);
    } else if (y > bottom) {
      y = bottom;
      vy = -Math.abs(vy);
    }
    return { x, y, vx, vy, radius: particle.radius };
  });
  return { ...world, particles };
}

/** Reset on resize: deterministic under identical seed, dimensions and count. */
export function resizeCanvasWorld(world: CanvasWorld, width: unknown, height: unknown): CanvasWorld {
  return createCanvasWorld(world.seed, world.particles.length, width, height);
}
