/** Finite inputs: this demo never executes arbitrary user CSS or HTML. */
export const ACCENTS = [
  { value: "#146B67", label: "Deep teal" },
  { value: "#8054B2", label: "Iris" },
  { value: "#B44C38", label: "Terracotta" }
] as const;
export const RADII = [0, 8, 16, 24] as const;
export const COLUMNS = [1, 2, 3] as const;
export const GAPS = [8, 16, 24, 32] as const;
export const MOTIONS = ["none", "subtle"] as const;

export type Accent = (typeof ACCENTS)[number]["value"];
export type Radius = (typeof RADII)[number];
export type Columns = (typeof COLUMNS)[number];
export type Gap = (typeof GAPS)[number];
export type Motion = (typeof MOTIONS)[number];

export type StudioState = {
  accent: Accent;
  radiusPx: Radius;
  columns: Columns;
  gapPx: Gap;
  motion: Motion;
};

export const DEFAULT_STATE: StudioState = {
  accent: "#146B67",
  radiusPx: 16,
  columns: 2,
  gapPx: 16,
  motion: "none"
};

type Candidate = Partial<Record<keyof StudioState, unknown>>;

export function normalizeStudioState(input: Candidate): StudioState {
  const accent = ACCENTS.find((option) => option.value === input.accent)?.value ?? DEFAULT_STATE.accent;
  const radiusPx = RADII.find((n) => n === input.radiusPx) ?? DEFAULT_STATE.radiusPx;
  const columns = COLUMNS.find((n) => n === input.columns) ?? DEFAULT_STATE.columns;
  const gapPx = GAPS.find((n) => n === input.gapPx) ?? DEFAULT_STATE.gapPx;
  const motion = MOTIONS.find((n) => n === input.motion) ?? DEFAULT_STATE.motion;
  return { accent, radiusPx, columns, gapPx, motion };
}

export function generateCss(input: Candidate): string {
  const state = normalizeStudioState(input);
  return [
    ".demo-preview {",
    "  --studio-accent: " + state.accent + ";",
    "  --studio-radius: " + state.radiusPx + "px;",
    "  --studio-gap: " + state.gapPx + "px;",
    "  --studio-columns: " + state.columns + ";",
    "  --studio-duration: " + (state.motion === "subtle" ? "160ms" : "0ms") + ";",
    "}",
    ".demo-preview__grid {",
    "  display: grid;",
    "  grid-template-columns: repeat(var(--studio-columns), minmax(0, 1fr));",
    "  gap: var(--studio-gap);",
    "}",
    ".demo-preview__tile {",
    "  border-radius: var(--studio-radius);",
    "  border-color: var(--studio-accent);",
    "  transition: background-color var(--studio-duration) ease;",
    "}",
    "@media (prefers-reduced-motion: reduce) {",
    "  .demo-preview__tile { transition: none; }",
    "}"
  ].join("\n");
}
