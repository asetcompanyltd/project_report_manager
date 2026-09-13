import type { ReactNode } from "react";

interface CardProps {
  title?: ReactNode;
  hint?: string;
  headerExtra?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Card({ title, hint, headerExtra, children, className }: CardProps) {
  return (
    <div className={["card", className].filter(Boolean).join(" ")}>
      {title && (
        <h2>
          <span>
            {title}
            {hint && <span className="hint"> {hint}</span>}
          </span>
          {headerExtra}
        </h2>
      )}
      {children}
    </div>
  );
}
