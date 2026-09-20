import { KanbanBoard } from "./KanbanBoard.js";
import { KanbanCard } from "./KanbanCard.js";
import { KanbanColumn } from "./KanbanColumn.js";
import { KanbanRoot } from "./KanbanRoot.js";
import { KanbanToolbar } from "./KanbanToolbar.js";

export const Kanban = Object.assign(KanbanRoot, {
  Root: KanbanRoot,
  Toolbar: KanbanToolbar,
  Board: KanbanBoard,
  Column: KanbanColumn,
  Card: KanbanCard,
});

export * from "./KanbanContext.js";
