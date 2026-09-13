"use client";

import { Card } from "@/components/ui/Card";
import type { Report } from "@/types/report";
import type { ReportWorkspace } from "@/hooks/useReportWorkspace";

export function NotesCard({ report, workspace }: { report: Report; workspace: ReportWorkspace }) {
  return (
    <Card title="Notes" description="Any caveats or context worth calling out for stakeholders.">
      <textarea
        value={report.notes}
        onChange={(e) => workspace.updateNotes(e.target.value)}
        rows={3}
        placeholder="Add notes about assumptions, estimates, or context for this report…"
      />
    </Card>
  );
}
