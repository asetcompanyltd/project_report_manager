import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./Button";

export function Pagination({
  page,
  pageCount,
  onChange,
}: {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
}) {
  if (pageCount <= 1) return null;

  const pages = Array.from({ length: pageCount }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center gap-1">
      <Button variant="ghost" size="sm" onClick={() => onChange(page - 1)} disabled={page <= 1} aria-label="Previous page">
        <ChevronLeft className="size-4" />
      </Button>
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={[
            "size-8 rounded-lg text-sm font-medium transition-colors",
            p === page ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100",
          ].join(" ")}
          aria-current={p === page ? "page" : undefined}
        >
          {p}
        </button>
      ))}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onChange(page + 1)}
        disabled={page >= pageCount}
        aria-label="Next page"
      >
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}
