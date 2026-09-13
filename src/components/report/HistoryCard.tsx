"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { Report } from "@/types/report";
import type { ReportWorkspace } from "@/hooks/useReportWorkspace";

export function HistoryCard({ report, workspace }: { report: Report; workspace: ReportWorkspace }) {
  return (
    <Card title="History">
      <details className="history">
        <summary>Show change history ({report.changeLog.length})</summary>
        <div style={{ marginTop: 10 }}>
          {report.changeLog.length === 0 ? (
            <div className="log-empty">No changes logged yet. Status and progress updates will appear here.</div>
          ) : (
            report.changeLog.map((entry) => (
              <div className="log-entry" key={entry.id}>
                <span className="ts">{new Date(entry.ts).toLocaleString()}</span>
                {entry.message}
              </div>
            ))
          )}
        </div>
        <div className="history-actions">
          <Button
            variant="ghost"
            onClick={() => {
              if (window.confirm("Clear the change history log?")) workspace.clearHistory();
            }}
          >
            Clear history
          </Button>
        </div>
      </details>
    </Card>
  );
}
