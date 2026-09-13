import type { ItemStatus } from "@/db/schema";

export function autoStatusFromProgress(progress: number): ItemStatus {
  if (progress >= 100) return "Complete";
  if (progress <= 0) return "Not Started";
  return "In Progress";
}

export function isOverdue(targetDate: string, status: ItemStatus, today = new Date().toISOString().slice(0, 10)): boolean {
  if (status === "Complete") return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(targetDate)) return false;
  return targetDate < today;
}

export function computeOverallProgress(phases: { progress: number }[]): number {
  if (!phases.length) return 0;
  const sum = phases.reduce((a, p) => a + (Number(p.progress) || 0), 0);
  return Math.round(sum / phases.length);
}
