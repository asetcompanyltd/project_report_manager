"use client";

import { ArrowUp, ArrowDown, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Tooltip } from "@/components/ui/Tooltip";
import { useConfirm } from "@/hooks/useConfirm";
import { SiteBlock } from "./SiteBlock";
import type { Phase, PhaseDetail } from "@/types/report";
import type { ReportWorkspace } from "@/hooks/useReportWorkspace";

export function PhaseDetailSection({
  phaseDetail,
  index,
  sectionCount,
  phases,
  workspace,
}: {
  phaseDetail: PhaseDetail;
  index: number;
  sectionCount: number;
  phases: Phase[];
  workspace: ReportWorkspace;
}) {
  const confirm = useConfirm();

  async function handleRemove() {
    const phase = phases.find((p) => p.id === phaseDetail.phaseId);
    const label = phase ? phase.name : "this section";
    const ok = await confirm({
      title: "Remove site detail section?",
      description: `This removes the section for "${label}" and every site/component inside it. This cannot be undone.`,
      confirmLabel: "Remove section",
      danger: true,
    });
    if (ok) await workspace.removePhaseDetail(phaseDetail.id);
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div className="flex min-w-0 items-center gap-2">
          <select
            value={phaseDetail.phaseId ?? ""}
            onChange={(e) => workspace.linkPhaseDetail(phaseDetail.id, e.target.value)}
            className="!w-auto max-w-[220px] !border-0 !bg-transparent !p-0 !text-sm !font-semibold !text-slate-800 !shadow-none focus-visible:!ring-0"
          >
            {!phases.some((p) => p.id === phaseDetail.phaseId) && (
              <option value="" disabled>
                Select a phase…
              </option>
            )}
            {phases.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <span className="shrink-0 text-xs font-medium uppercase tracking-wide text-slate-400">Site Detail</span>
        </div>
        <div className="flex gap-0.5">
          <Tooltip label="Move up">
            <Button
              variant="icon"
              size="sm"
              disabled={index === 0}
              onClick={() => workspace.reorderPhaseDetail(phaseDetail.id, "up")}
              aria-label="Move up"
            >
              <ArrowUp className="size-3.5" />
            </Button>
          </Tooltip>
          <Tooltip label="Move down">
            <Button
              variant="icon"
              size="sm"
              disabled={index === sectionCount - 1}
              onClick={() => workspace.reorderPhaseDetail(phaseDetail.id, "down")}
              aria-label="Move down"
            >
              <ArrowDown className="size-3.5" />
            </Button>
          </Tooltip>
          <Tooltip label="Remove section">
            <Button variant="icon" size="sm" onClick={handleRemove} aria-label="Remove section">
              <Trash2 className="size-4" />
            </Button>
          </Tooltip>
        </div>
      </div>

      <div className="space-y-4 p-5">
        {phaseDetail.sites.map((site, si) => (
          <SiteBlock
            key={site.id}
            phaseDetail={phaseDetail}
            site={site}
            index={si}
            siteCount={phaseDetail.sites.length}
            workspace={workspace}
          />
        ))}
        <Button variant="secondary" size="sm" onClick={() => workspace.addSite(phaseDetail.id)}>
          <Plus className="size-4" />
          Add site
        </Button>
      </div>
    </div>
  );
}
