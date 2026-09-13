import type { ItemStatus } from "@/types/report";

export function statusClass(status: string): string {
  return "status-" + status.replace(/\s+/g, "-");
}

const STATUS_OPTIONS: ItemStatus[] = ["Complete", "In Progress", "Not Started"];

export function StatusSelect({
  value,
  onChange,
}: {
  value: ItemStatus;
  onChange: (value: ItemStatus) => void;
}) {
  return (
    <select className={`status-select ${statusClass(value)}`} value={value} onChange={(e) => onChange(e.target.value as ItemStatus)}>
      {STATUS_OPTIONS.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}

export function OverdueBadge({ show }: { show: boolean }) {
  if (!show) return null;
  return <div className="overdue-badge">OVERDUE</div>;
}
