"use client";

import { Button } from "@/components/ui/Button";
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
  async function handleRemove() {
    const phase = phases.find((p) => p.id === phaseDetail.phaseId);
    const label = phase ? phase.name : "this section";
    if (window.confirm(`Remove phase detail section for "${label}"? This cannot be undone.`)) {
      await workspace.removePhaseDetail(phaseDetail.id);
    }
  }

  return (
    <div className="card phase-detail-block">
      <h2>
        <div className="phase-detail-head">
          <select
            className="phase-select"
            value={phaseDetail.phaseId ?? ""}
            onChange={(e) => workspace.linkPhaseDetail(phaseDetail.id, e.target.value)}
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
          <span className="phase-suffix">— Site Detail</span>
        </div>
        <div className="move-group">
          <Button
            variant="icon"
            className="up"
            title="Move up"
            disabled={index === 0}
            onClick={() => workspace.reorderPhaseDetail(phaseDetail.id, "up")}
          >
            &#8593;
          </Button>
          <Button
            variant="icon"
            className="down"
            title="Move down"
            disabled={index === sectionCount - 1}
            onClick={() => workspace.reorderPhaseDetail(phaseDetail.id, "down")}
          >
            &#8595;
          </Button>
          <Button variant="icon" title="Remove section" onClick={handleRemove}>
            &#10005;
          </Button>
        </div>
      </h2>

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
      <div className="add-row">
        <Button variant="ghost" onClick={() => workspace.addSite(phaseDetail.id)}>
          + Add site
        </Button>
      </div>
    </div>
  );
}
