import { AlertTriangle } from "lucide-react";
import type { ItemStatus } from "@/types/report";

const STATUS_OPTIONS: ItemStatus[] = ["Complete", "In Progress", "Not Started"];

const STATUS_TEXT_CLASS: Record<ItemStatus, string> = {
  Complete: "text-emerald-700",
  "In Progress": "text-amber-700",
  "Not Started": "text-slate-500",
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
      className={`!py-1.5 font-semibold ${STATUS_TEXT_CLASS[value]}`}
      value={value}
      onChange={(e) => onChange(e.target.value as ItemStatus)}
    >
      {STATUS_OPTIONS.map((s) => (
        <option key={s} value={s} className="text-slate-900">
          {s}
        </option>
      ))}
    </select>
  );
}

export function OverdueBadge({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-red-700">
      <AlertTriangle className="size-3" />
      Overdue
    </div>
  );
}
