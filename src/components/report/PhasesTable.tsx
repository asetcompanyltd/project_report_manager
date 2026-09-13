"use client";

import { ArrowUp, ArrowDown, Trash2, Plus, ListChecks } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Tooltip } from "@/components/ui/Tooltip";
import { StatusSelect, OverdueBadge } from "@/components/ui/StatusBadge";
import { isOverdue } from "@/utils/status";
import { useConfirm } from "@/hooks/useConfirm";
import type { Report } from "@/types/report";
import type { ReportWorkspace } from "@/hooks/useReportWorkspace";

const th = "px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500";
const td = "px-3 py-2.5 align-top";

export function PhasesTable({ report, workspace }: { report: Report; workspace: ReportWorkspace }) {
  const confirm = useConfirm();

  async function handleRemove(phaseId: string) {
    const result = await workspace.removePhase(phaseId);
    if (result && !result.ok && result.needsCascadeConfirm) {
      const ok = await confirm({
        title: "Remove phase?",
        description: result.message,
        confirmLabel: "Remove phase & sections",
        danger: true,
      });
      if (ok) await workspace.removePhaseCascade(phaseId);
    }
  }

  return (
    <Card title="Project Phase Status" description="Track each phase's status, progress, and target date.">
      {report.phases.length === 0 ? (
        <EmptyState
          icon={ListChecks}
          title="No phases yet"
          description="Add the first phase of this project to start tracking progress."
          action={
            <Button variant="primary" size="sm" onClick={() => workspace.addPhase()}>
              <Plus className="size-4" />
              Add phase
            </Button>
          }
        />
      ) : (
        <>
          <div className="-mx-5 overflow-x-auto px-5">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className={`${th} w-16`}></th>
                  <th className={th}>Phase</th>
                  <th className={`${th} w-36`}>Status</th>
                  <th className={`${th} w-24`}>Progress %</th>
                  <th className={`${th} w-40`}>Target Date</th>
                  <th className={th}>Remarks</th>
                  <th className={`${th} w-10`}></th>
                </tr>
              </thead>
              <tbody>
                {report.phases.map((p, i) => {
                  const overdue = isOverdue(p.targetDate, p.status);
                  return (
                    <tr key={p.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60">
                      <td className={td}>
                        <div className="flex gap-0.5">
                          <Tooltip label="Move up">
                            <Button
                              variant="icon"
                              size="sm"
                              disabled={i === 0}
                              onClick={() => workspace.reorderPhase(p.id, "up")}
                              aria-label="Move up"
                            >
                              <ArrowUp className="size-3.5" />
                            </Button>
                          </Tooltip>
                          <Tooltip label="Move down">
                            <Button
                              variant="icon"
                              size="sm"
                              disabled={i === report.phases.length - 1}
                              onClick={() => workspace.reorderPhase(p.id, "down")}
                              aria-label="Move down"
                            >
                              <ArrowDown className="size-3.5" />
                            </Button>
                          </Tooltip>
                        </div>
                      </td>
                      <td className={td}>
                        <input
                          type="text"
                          value={p.name}
                          onChange={(e) => workspace.updatePhaseField(p.id, "name", e.target.value)}
                        />
                      </td>
                      <td className={td}>
                        <StatusSelect value={p.status} onChange={(status) => workspace.updatePhaseStatus(p.id, status)} />
                      </td>
                      <td className={td}>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={p.progress}
                          onChange={(e) => workspace.updatePhaseProgress(p.id, Number(e.target.value))}
                        />
                      </td>
                      <td className={td}>
                        <input
                          type="date"
                          value={p.targetDate}
                          onChange={(e) => workspace.updatePhaseField(p.id, "targetDate", e.target.value)}
                        />
                        <OverdueBadge show={overdue} />
                      </td>
                      <td className={td}>
                        <input
                          type="text"
                          value={p.remarks}
                          onChange={(e) => workspace.updatePhaseField(p.id, "remarks", e.target.value)}
                        />
                      </td>
                      <td className={td}>
                        <Tooltip label="Remove phase">
                          <Button variant="icon" size="sm" onClick={() => handleRemove(p.id)} aria-label="Remove phase">
                            <Trash2 className="size-4" />
                          </Button>
                        </Tooltip>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-4">
            <Button variant="secondary" size="sm" onClick={() => workspace.addPhase()}>
              <Plus className="size-4" />
              Add phase
            </Button>
          </div>
        </>
      )}
    </Card>
  );
}
