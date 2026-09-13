import type { ReactNode } from "react";

export type BadgeColor = "slate" | "green" | "amber" | "red" | "indigo" | "blue";

const COLOR_CLASS: Record<BadgeColor, string> = {
  slate: "bg-slate-100 text-slate-600 dark:bg-slate-700/60 dark:text-slate-300",
  green: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  amber: "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  red: "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-400",
  indigo: "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-400",
  blue: "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400",
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
