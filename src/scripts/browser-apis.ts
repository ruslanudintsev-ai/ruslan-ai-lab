import { DEFAULT_BOARD, BOARD_LABELS, STORAGE_KEY, moveBoardItem, dropBoardItemBefore, parseSavedBoard, serializeBoard } from "../domain/browser-apis";
import type { BoardId, Direction } from "../domain/browser-apis";

const root = document.querySelector<HTMLElement>("[data-browser-apis]");
const list = root?.querySelector<HTMLOListElement>("[data-board-list]");
const status = root?.querySelector<HTMLElement>("[data-board-status]");
const reset = root?.querySelector<HTMLButtonElement>("[data-board-reset]");
const save = root?.querySelector<HTMLButtonElement>("[data-board-save]");
const clear = root?.querySelector<HTMLButtonElement>("[data-board-clear]");
const help = root?.querySelector<HTMLElement>("[data-board-help]");

if (root && list && status && reset && save && clear && help) {
  const board = list;
  const announcement = status;
  const cards = new Map<BoardId, HTMLLIElement>();
  for (const el of board.querySelectorAll<HTMLLIElement>("li[data-board-id]")) {
    const id = el.dataset.boardId as BoardId;
    if (DEFAULT_BOARD.includes(id)) cards.set(id, el);
  }

  if (cards.size === DEFAULT_BOARD.length) {
    let order: BoardId[] = [...DEFAULT_BOARD];
    let dragging: BoardId | null = null;

    function render(focus?: HTMLElement): void {
      for (const [index, id] of order.entries()) {
        const card = cards.get(id);
        if (!card) continue;
        card.querySelector<HTMLElement>("[data-position]")!.textContent = String(index + 1).padStart(2, "0");
        const up = card.querySelector<HTMLButtonElement>('button[data-move="up"]')!;
        const down = card.querySelector<HTMLButtonElement>('button[data-move="down"]')!;
        up.disabled = index === 0;
        down.disabled = index === order.length - 1;
        card.draggable = true;
        board.append(card);
      }
      board.dataset.order = order.join(",");
      focus?.focus();
    }

    board.addEventListener("click", event => {
      const element = event.target;
      if (!(element instanceof Element)) return;
      const button = element.closest<HTMLButtonElement>("button[data-move]");
      const card = button?.closest<HTMLLIElement>("li[data-board-id]");
      if (!button || !card) return;
      const id = card.dataset.boardId as BoardId;
      const direction = button.dataset.move as Direction;
      if (!DEFAULT_BOARD.includes(id) || !["up", "down"].includes(direction)) return;
      const updated = moveBoardItem(order, id, direction);
      if (updated.join(",") === order.join(",")) return;
      order = updated;
      render(button);
      announcement.textContent = BOARD_LABELS[id] + " moved " + direction + ". This change is not saved yet.";
    });

    board.addEventListener("dragstart", event => {
      const element = event.target;
      if (!(element instanceof Element)) return;
      const card = element.closest<HTMLLIElement>("li[data-board-id]");
      const id = card?.dataset.boardId as BoardId;
      if (!card || !DEFAULT_BOARD.includes(id) || !event.dataTransfer) {
        event.preventDefault();
        return;
      }
      dragging = id;
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", id);
    });
    board.addEventListener("dragover", event => {
      if (!dragging) return;
      const element = event.target;
      const card = element instanceof Element ? element.closest<HTMLLIElement>("li[data-board-id]") : null;
      if (!card || !DEFAULT_BOARD.includes(card.dataset.boardId as BoardId)) return;
      event.preventDefault();
      if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
    });
    board.addEventListener("drop", event => {
      const element = event.target;
      const card = element instanceof Element ? element.closest<HTMLLIElement>("li[data-board-id]") : null;
      const target = card?.dataset.boardId;
      if (!dragging || !target) return;
      event.preventDefault();
      const updated = dropBoardItemBefore(order, dragging, target);
      if (updated.join(",") !== order.join(",")) {
        order = updated;
        render();
        announcement.textContent = "Moved " + BOARD_LABELS[dragging] + " before " + BOARD_LABELS[target as BoardId] + ". Not saved yet.";
      }
      dragging = null;
    });
    board.addEventListener("dragend", () => { dragging = null; });

    reset.addEventListener("click", () => {
      order = [...DEFAULT_BOARD];
      render(reset);
      announcement.textContent = "Board reset to default. Any previously saved copy remains until you clear or overwrite it.";
    });
    save.addEventListener("click", () => {
      try {
        window.localStorage.setItem(STORAGE_KEY, serializeBoard(order));
        announcement.textContent = "Order saved in this browser only. Nothing was sent to a server.";
      } catch {
        announcement.textContent = "Browser storage unavailable. Your visible board still works, but was not saved.";
      }
    });
    clear.addEventListener("click", () => {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
        announcement.textContent = "Saved copy cleared. Current on-screen order is unchanged.";
      } catch {
        announcement.textContent = "Browser storage unavailable. Could not confirm removal of a saved copy.";
      }
    });

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const saved = parseSavedBoard(raw);
      if (saved) {
        order = saved;
        announcement.textContent = "Previously saved order restored from this browser.";
      } else if (raw !== null) {
        announcement.textContent = "Unrecognized saved data ignored. Default board loaded.";
      } else {
        announcement.textContent = "Reorder cards with buttons or optional pointer drag. Saving is always explicit.";
      }
    } catch {
      announcement.textContent = "Storage access is blocked. Reordering works without saving.";
    }
    render();
    reset.disabled = false;
    save.disabled = false;
    clear.disabled = false;
    help.hidden = true;
  }
}
