import { AlertTriangle } from "lucide-react";
import type { ItemStatus } from "@/types/report";

const STATUS_OPTIONS: ItemStatus[] = ["Complete", "In Progress", "Not Started"];

const STATUS_BADGE_CLASS: Record<ItemStatus, string> = {
  Complete: "!bg-emerald-100 !text-emerald-800 dark:!bg-emerald-500/20 dark:!text-emerald-400",
  "In Progress": "!bg-orange-100 !text-orange-800 dark:!bg-orange-500/20 dark:!text-orange-400",
  "Not Started": "!bg-slate-200 !text-slate-600 dark:!bg-slate-700 dark:!text-slate-300",
};

export function StatusSelect({
  value,
  onChange,
}: {
  value: ItemStatus;
  onChange: (value: ItemStatus) => void;
}) {
  return (
    <select
      className={`!w-auto !rounded-full !border-0 !py-1.5 !pl-3 !pr-7 !text-xs !font-bold !shadow-none cursor-pointer ${STATUS_BADGE_CLASS[value]}`}
      value={value}
      onChange={(e) => onChange(e.target.value as ItemStatus)}
    >
      {STATUS_OPTIONS.map((s) => (
        <option key={s} value={s} className="bg-white font-normal text-slate-900 dark:bg-slate-800 dark:text-slate-100">
          {s}
        </option>
      ))}
    </select>
  );
}

export function OverdueBadge({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-red-700 dark:bg-red-500/15 dark:text-red-400">
      <AlertTriangle className="size-3" />
      Overdue
    </div>
  );
}
