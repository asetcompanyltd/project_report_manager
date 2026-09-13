import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center text-xs text-slate-500 dark:text-slate-400">
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={i} className="flex items-center">
            {i > 0 && <ChevronRight className="mx-1.5 size-3.5 text-slate-300 dark:text-slate-600" />}
            {item.href && !isLast ? (
              <Link href={item.href} className="font-medium hover:text-slate-700 dark:hover:text-slate-200">
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? "font-semibold text-slate-700 dark:text-slate-200" : ""}>{item.label}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
