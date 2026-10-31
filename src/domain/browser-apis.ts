/** A fixed, non-personal demo board. No arbitrary visitor content is persisted. */
export const DEFAULT_BOARD = ["inspect", "build", "verify"] as const;
export type BoardId = (typeof DEFAULT_BOARD)[number];
export type Direction = "up" | "down";
export const STORAGE_KEY = "ruslan-ai-lab:browser-apis:board:v1";

export const BOARD_LABELS: Readonly<Record<BoardId, string>> = {
  inspect: "Inspect", build: "Build", verify: "Verify"
};
export const BOARD_DESCRIPTIONS: Readonly<Record<BoardId, string>> = {
  inspect: "Check the inputs and identify constraints.",
  build: "Make one small, testable change.",
  verify: "Review the evidence before release."
};

export function normalizeBoard(value: unknown): BoardId[] {
  if (!Array.isArray(value) || value.length !== DEFAULT_BOARD.length) return [...DEFAULT_BOARD];
  const allowed = new Set<string>(DEFAULT_BOARD);
  if (!value.every((x): x is BoardId => typeof x === "string" && allowed.has(x))) return [...DEFAULT_BOARD];
  if (new Set(value).size !== DEFAULT_BOARD.length) return [...DEFAULT_BOARD];
  return [...value];
}

export function moveBoardItem(input: unknown, id: BoardId, direction: Direction): BoardId[] {
  const order = normalizeBoard(input);
  const source = order.indexOf(id);
  const target = source + (direction === "up" ? -1 : 1);
  if (source < 0 || target < 0 || target >= order.length) return order;
  [order[source], order[target]] = [order[target], order[source]];
  return order;
}

export function dropBoardItemBefore(input: unknown, dragged: string, target: string): BoardId[] {
  const order = normalizeBoard(input);
  if (dragged === target || !order.includes(dragged as BoardId) || !order.includes(target as BoardId)) return order;
  const withoutDragged = order.filter(id => id !== dragged);
  const targetIndex = withoutDragged.indexOf(target as BoardId);
  withoutDragged.splice(targetIndex, 0, dragged as BoardId);
  return withoutDragged;
}

export function serializeBoard(input: unknown): string {
  return JSON.stringify({ version: 1, order: normalizeBoard(input) });
}

/** Unknown or damaged saved data is ignored instead of being rendered. */
export function parseSavedBoard(raw: string | null): BoardId[] | null {
  if (raw === null || raw.length > 256) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return null;
    const data = parsed as { version?: unknown; order?: unknown };
    if (data.version !== 1 || !Array.isArray(data.order)) return null;
    const order = normalizeBoard(data.order);
    return JSON.stringify(order) === JSON.stringify(data.order) ? order : null;
  } catch {
    return null;
  }
}
