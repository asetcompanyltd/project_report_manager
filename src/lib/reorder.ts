/**
 * Given a list of sibling rows (already scoped to the same parent) and a target id,
 * returns the two rows whose sortOrder should be swapped to move the target up/down —
 * or null if the target is already at that edge (no-op).
 */
export function computeReorderSwap<T extends { id: string; sortOrder: number }>(
  rows: T[],
  targetId: string,
  direction: "up" | "down"
): [T, T] | null {
  const sorted = [...rows].sort((a, b) => a.sortOrder - b.sortOrder);
  const idx = sorted.findIndex((r) => r.id === targetId);
  if (idx === -1) return null;
  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= sorted.length) return null;
  return [sorted[idx], sorted[swapIdx]];
}

export function nextSortOrder<T extends { sortOrder: number }>(rows: T[]): number {
  return rows.reduce((max, r) => Math.max(max, r.sortOrder), -1) + 1;
}
