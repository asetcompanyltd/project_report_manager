"use client";

import { ChevronDown, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useConfirm } from "@/hooks/useConfirm";
import type { Report } from "@/types/report";
import type { ReportWorkspace } from "@/hooks/useReportWorkspace";

export function HistoryCard({ report, workspace }: { report: Report; workspace: ReportWorkspace }) {
  const confirm = useConfirm();

  async function handleClear() {
    const ok = await confirm({
      title: "Clear change history?",
      description: "This removes the activity log for this report. This cannot be undone.",
      confirmLabel: "Clear history",
      danger: true,
    });
    if (ok) await workspace.clearHistory();
  }

  return (
    <Card title="History" noPadding>
      <details className="group px-5 py-4">
        <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-slate-700 marker:content-none">
          <span>Show change history ({report.changeLog.length})</span>
          <ChevronDown className="size-4 text-slate-400 transition-transform group-open:rotate-180" />
        </summary>
        <div className="mt-4 max-h-72 overflow-y-auto">
          {report.changeLog.length === 0 ? (
            <p className="py-2 text-sm text-slate-400">No changes logged yet. Status and progress updates will appear here.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {report.changeLog.map((entry) => (
                <li key={entry.id} className="flex flex-col gap-0.5 py-2 text-sm text-slate-700 sm:flex-row sm:gap-3">
                  <span className="shrink-0 text-xs text-slate-400 sm:w-40">{new Date(entry.ts).toLocaleString()}</span>
                  <span>{entry.message}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        {report.changeLog.length > 0 && (
          <div className="mt-3">
            <Button variant="ghost" size="sm" onClick={handleClear}>
              <Trash2 className="size-3.5" />
              Clear history
            </Button>
          </div>
        )}
      </details>
    </Card>
  );
}
