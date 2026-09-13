"use client";

import { Trash2, Plus, ListTodo } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Tooltip } from "@/components/ui/Tooltip";
import type { Report } from "@/types/report";
import type { ReportWorkspace } from "@/hooks/useReportWorkspace";

export function NextStepsList({ report, workspace }: { report: Report; workspace: ReportWorkspace }) {
  return (
    <Card title="Next Steps" description="Upcoming actions to move this project forward.">
      {report.nextSteps.length === 0 ? (
        <EmptyState
          compact
          icon={ListTodo}
          title="No next steps yet"
          description="Add the actions planned for this project."
        />
      ) : (
        <div className="space-y-2">
          {report.nextSteps.map((step) => (
            <div className="flex items-center gap-2" key={step.id}>
              <input
                type="text"
                value={step.text}
                onChange={(e) => workspace.updateNextStep(step.id, e.target.value)}
                placeholder="e.g. Complete cabling at Site B"
              />
              <Tooltip label="Remove">
                <Button variant="icon" size="sm" onClick={() => workspace.removeNextStep(step.id)} aria-label="Remove next step">
                  <Trash2 className="size-4" />
                </Button>
              </Tooltip>
            </div>
          ))}
        </div>
      )}
      <div className="mt-4">
        <Button variant="secondary" size="sm" onClick={() => workspace.addNextStep()}>
          <Plus className="size-4" />
          Add next step
        </Button>
      </div>
    </Card>
  );
}
