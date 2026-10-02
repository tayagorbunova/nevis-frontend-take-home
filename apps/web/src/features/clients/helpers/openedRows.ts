import type { ClientRow } from "./toClientTree";

export function openRow(openedIds: readonly string[], id: string): string[] {
  return [...openedIds.filter((openedId) => openedId !== id), id];
}

export function closeRow(openedIds: readonly string[], id: string): string[] {
  return openedIds.filter((openedId) => openedId !== id);
}

export type RowForChart = { row: ClientRow; isSplit: boolean };

export function pickRowForChart(tree: ClientRow, openedIds: readonly string[]): RowForChart {
  const visibleRows = listVisibleRows(tree, openedIds);

  for (const id of openedIds.toReversed()) {
    const row = visibleRows.find((visibleRow) => visibleRow.id === id);

    if (row && row.children.length > 0) return { row, isSplit: true };
  }

  return { row: tree, isSplit: false };
}

function listVisibleRows(row: ClientRow, openedIds: readonly string[]): ClientRow[] {
  const visibleChildren = openedIds.includes(row.id) ? row.children : [];

  return [row, ...visibleChildren.flatMap((child) => listVisibleRows(child, openedIds))];
}
