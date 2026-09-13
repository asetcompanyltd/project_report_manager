"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusSelect, OverdueBadge } from "@/components/ui/StatusBadge";
import { isOverdue } from "@/utils/status";
import type { Report } from "@/types/report";
import type { ReportWorkspace } from "@/hooks/useReportWorkspace";

export function PhasesTable({ report, workspace }: { report: Report; workspace: ReportWorkspace }) {
  async function handleRemove(phaseId: string) {
    const result = await workspace.removePhase(phaseId);
    if (result && !result.ok && result.needsCascadeConfirm) {
      if (window.confirm(result.message + "\n\nContinue?")) {
        await workspace.removePhaseCascade(phaseId);
      }
    }
  }

  return (
    <Card title="Project Phase Status">
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th className="col-move"></th>
              <th>Phase</th>
              <th className="col-status">Status</th>
              <th className="col-narrow">Progress %</th>
              <th className="col-date">Target Date</th>
              <th>Remarks</th>
              <th className="col-remove"></th>
            </tr>
          </thead>
          <tbody>
            {report.phases.map((p, i) => {
              const overdue = isOverdue(p.targetDate, p.status);
              return (
                <tr key={p.id}>
                  <td className="col-move">
                    <div className="move-group">
                      <Button
                        variant="icon"
                        className="up"
                        title="Move up"
                        disabled={i === 0}
                        onClick={() => workspace.reorderPhase(p.id, "up")}
                      >
                        &#8593;
                      </Button>
                      <Button
                        variant="icon"
                        className="down"
                        title="Move down"
                        disabled={i === report.phases.length - 1}
                        onClick={() => workspace.reorderPhase(p.id, "down")}
                      >
                        &#8595;
                      </Button>
                    </div>
                  </td>
                  <td>
                    <input
                      type="text"
                      value={p.name}
                      onChange={(e) => workspace.updatePhaseField(p.id, "name", e.target.value)}
                    />
                  </td>
                  <td>
                    <StatusSelect value={p.status} onChange={(status) => workspace.updatePhaseStatus(p.id, status)} />
                  </td>
                  <td>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={p.progress}
                      onChange={(e) => workspace.updatePhaseProgress(p.id, Number(e.target.value))}
                    />
                  </td>
                  <td>
                    <input
                      type="date"
                      value={p.targetDate}
                      onChange={(e) => workspace.updatePhaseField(p.id, "targetDate", e.target.value)}
                    />
                    <OverdueBadge show={overdue} />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={p.remarks}
                      onChange={(e) => workspace.updatePhaseField(p.id, "remarks", e.target.value)}
                    />
                  </td>
                  <td className="col-remove">
                    <Button variant="icon" title="Remove phase" onClick={() => handleRemove(p.id)}>
                      &#10005;
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="add-row">
        <Button variant="ghost" onClick={() => workspace.addPhase()}>
          + Add phase
        </Button>
      </div>
    </Card>
  );
}

