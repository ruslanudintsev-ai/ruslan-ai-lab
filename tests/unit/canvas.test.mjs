import test from "node:test";
import assert from "node:assert/strict";
import {
  createCanvasWorld,
  resizeCanvasWorld,
  stepCanvasWorld,
  normalizeParticleCount,
  normalizeSeed,
  MIN_PARTICLES,
  MAX_PARTICLES
} from "../../src/domain/canvas.ts";

test("same seed and dimensions always create the same world", () => {
  const a = createCanvasWorld(12345, 24, 640, 360);
  const b = createCanvasWorld(12345, 24, 640, 360);
  assert.deepEqual(a, b);
  assert.notDeepEqual(a, createCanvasWorld(12346, 24, 640, 360));
  assert.equal(a.seed, 12345);
});

test("particle counts, dimensions and seeds are bounded even for invalid inputs", () => {
  assert.equal(normalizeParticleCount(-100), MIN_PARTICLES);
  assert.equal(normalizeParticleCount(9999), MAX_PARTICLES);
  assert.equal(normalizeParticleCount(Number.NaN), 24);
  assert.equal(normalizeSeed(-1), 42);
  assert.equal(normalizeSeed(Number.POSITIVE_INFINITY), 42);
  assert.equal(normalizeSeed(0xffffffff), 0xffffffff);
  const world = createCanvasWorld("injected", 999, Number.NaN, Infinity);
  assert.equal(world.seed, 42);
  assert.equal(world.particles.length, MAX_PARTICLES);
  assert.equal(world.width, 680);
  assert.equal(world.height, 360);
});

test("all generated particles are finite and contained within the world", () => {
  for (const seed of [0, 1, 42, 0xffffffff]) {
    const world = createCanvasWorld(seed, 60, 160, 120);
    for (const p of world.particles) {
      assert.ok([p.x, p.y, p.vx, p.vy, p.radius].every(Number.isFinite));
      assert.ok(p.x >= p.radius && p.x <= world.width - p.radius);
      assert.ok(p.y >= p.radius && p.y <= world.height - p.radius);
    }
  }
});

test("step is deterministic, pure and bounded under large frame delays", () => {
  const start = createCanvasWorld(14, 22, 500, 250);
  const before = structuredClone(start);
  const a = stepCanvasWorld(start, 1000);
  const b = stepCanvasWorld(start, 1000);
  assert.deepEqual(a, b);
  assert.deepEqual(start, before, "input world must not be mutated");
  assert.notStrictEqual(a.particles, start.particles);
  assert.deepEqual(stepCanvasWorld(start, -1), stepCanvasWorld(start, 0));
  assert.deepEqual(stepCanvasWorld(start, NaN), stepCanvasWorld(start, 0));
  assert.deepEqual(stepCanvasWorld(start, Infinity), stepCanvasWorld(start, 0));
});

test("boundary collision reflects velocity without leaving visible bounds", () => {
  const world = {
    seed: 42, width: 200, height: 120,
    particles: [
      { x: 193, y: 60, vx: 3, vy: 0, radius: 6 },
      { x: 7, y: 60, vx: -3, vy: 0, radius: 6 },
      { x: 100, y: 113, vx: 0, vy: 3, radius: 6 },
      { x: 100, y: 7, vx: 0, vy: -3, radius: 6 }
    ]
  };
  const after = stepCanvasWorld(world, 1000 / 60);
  assert.equal(after.particles[0].x, 194);
  assert.ok(after.particles[0].vx < 0);
  assert.equal(after.particles[1].x, 6);
  assert.ok(after.particles[1].vx > 0);
  assert.equal(after.particles[2].y, 114);
  assert.ok(after.particles[2].vy < 0);
  assert.equal(after.particles[3].y, 6);
  assert.ok(after.particles[3].vy > 0);
});

test("hundreds of deterministic frames remain inside the canvas and do not mutate prior frames", () => {
  let world = createCanvasWorld(87, 60, 400, 240);
  const first = structuredClone(world);
  for (let frame = 0; frame < 600; frame += 1) {
    world = stepCanvasWorld(world, 1000 / 60);
    for (const particle of world.particles) {
      assert.ok(Number.isFinite(particle.x) && Number.isFinite(particle.y));
      assert.ok(particle.x >= particle.radius && particle.x <= world.width - particle.radius);
      assert.ok(particle.y >= particle.radius && particle.y <= world.height - particle.radius);
    }
  }
  assert.deepEqual(createCanvasWorld(87, 60, 400, 240), first);
});

test("resize resets from the same seed at bounded dimensions", () => {
  const original = createCanvasWorld(84, 24, 400, 300);
  const resized = resizeCanvasWorld(original, 800, 500);
  assert.deepEqual(resized, createCanvasWorld(84, 24, 800, 500));
  assert.deepEqual(original, createCanvasWorld(84, 24, 400, 300));
});
