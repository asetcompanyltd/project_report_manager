"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { Report } from "@/types/report";
import type { ReportWorkspace } from "@/hooks/useReportWorkspace";

export function NextStepsList({ report, workspace }: { report: Report; workspace: ReportWorkspace }) {
  return (
    <Card title="Next Steps">
      <div className="list-editor">
        {report.nextSteps.map((step) => (
          <div className="item-row" key={step.id}>
            <input type="text" value={step.text} onChange={(e) => workspace.updateNextStep(step.id, e.target.value)} />
            <Button variant="icon" title="Remove" onClick={() => workspace.removeNextStep(step.id)}>
              &#10005;
            </Button>
          </div>
        ))}
      </div>
      <div className="add-row">
        <Button variant="ghost" onClick={() => workspace.addNextStep()}>
          + Add next step
        </Button>
      </div>
    </Card>
  );
}
