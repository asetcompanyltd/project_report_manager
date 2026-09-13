import type { ReactNode } from "react";

interface CardProps {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  noPadding?: boolean;
}

export function Card({ title, description, actions, children, className, bodyClassName, noPadding }: CardProps) {
  return (
    <div className={["rounded-xl border border-slate-200 bg-white shadow-sm", className].filter(Boolean).join(" ")}>
      {(title || actions) && (
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div className="min-w-0">
            {title && <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-800">{title}</h2>}
            {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
          </div>
          {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={bodyClassName ?? (noPadding ? "" : "p-5")}>{children}</div>
    </div>
  );
}
