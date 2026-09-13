import type { ReactNode } from "react";

export type BadgeColor = "slate" | "green" | "amber" | "red" | "indigo" | "blue";

const COLOR_CLASS: Record<BadgeColor, string> = {
  slate: "bg-slate-100 text-slate-600",
  green: "bg-emerald-50 text-emerald-700",
  amber: "bg-amber-50 text-amber-700",
  red: "bg-red-50 text-red-700",
  indigo: "bg-indigo-50 text-indigo-700",
  blue: "bg-blue-50 text-blue-700",
};

export function Badge({
  color = "slate",
  icon,
  children,
  className,
}: {
  color?: BadgeColor;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
        COLOR_CLASS[color],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {icon}
      {children}
    </span>
  );
}
