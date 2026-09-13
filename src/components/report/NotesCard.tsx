"use client";

import { Card } from "@/components/ui/Card";
import type { Report } from "@/types/report";
import type { ReportWorkspace } from "@/hooks/useReportWorkspace";

export function NotesCard({ report, workspace }: { report: Report; workspace: ReportWorkspace }) {
  return (
    <Card title="Notes">
      <textarea value={report.notes} onChange={(e) => workspace.updateNotes(e.target.value)} />
    </Card>
  );
}
