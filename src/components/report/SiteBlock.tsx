"use client";

import { Button } from "@/components/ui/Button";
import { StatusSelect, OverdueBadge } from "@/components/ui/StatusBadge";
import { isOverdue } from "@/utils/status";
import type { PhaseDetail, Site } from "@/types/report";
import type { ReportWorkspace } from "@/hooks/useReportWorkspace";

export function SiteBlock({
  phaseDetail,
  site,
  index,
  siteCount,
  workspace,
}: {
  phaseDetail: PhaseDetail;
  site: Site;
  index: number;
  siteCount: number;
  workspace: ReportWorkspace;
}) {
  const overdue = isOverdue(site.targetDate, site.status);

  return (
    <div className="site-block">
      <div className="site-block-head">
        <div className="move-group">
          <Button
            variant="icon"
            className="up"
            title="Move up"
            disabled={index === 0}
            onClick={() => workspace.reorderSite(site.id, "up")}
          >
            &#8593;
          </Button>
          <Button
            variant="icon"
            className="down"
            title="Move down"
            disabled={index === siteCount - 1}
            onClick={() => workspace.reorderSite(site.id, "down")}
          >
            &#8595;
          </Button>
        </div>
        <div className="field">
          <label>Site Name</label>
          <input
            type="text"
            value={site.name}
            onChange={(e) => workspace.updateSiteField(phaseDetail.id, site.id, "name", e.target.value)}
          />
        </div>
        <div className="field" style={{ flex: 1 }}>
          <label>Status</label>
          <StatusSelect value={site.status} onChange={(status) => workspace.updateSiteStatus(phaseDetail.id, site.id, status)} />
        </div>
        <div className="field" style={{ flex: 1 }}>
          <label>Progress %</label>
          <input
            type="number"
            min={0}
            max={100}
            value={site.progress}
            onChange={(e) => workspace.updateSiteProgress(phaseDetail.id, site.id, Number(e.target.value))}
          />
        </div>
        <div className="field" style={{ flex: 1 }}>
          <label>Target Completion</label>
          <input
            type="text"
            value={site.targetDate}
            placeholder="date or Completed"
            onChange={(e) => workspace.updateSiteField(phaseDetail.id, site.id, "targetDate", e.target.value)}
          />
          <OverdueBadge show={overdue} />
        </div>
        <Button variant="icon" title="Remove site" onClick={() => workspace.removeSite(site.id)}>
          &#10005;
        </Button>
      </div>

      <div className="site-items">
        {site.items.map((item) => (
          <div className="item-row" key={item.id}>
            <input
              type="text"
              value={item.text}
              onChange={(e) => workspace.updateSiteItem(phaseDetail.id, site.id, item.id, e.target.value)}
            />
            <Button variant="icon" title="Remove" onClick={() => workspace.removeSiteItem(item.id)}>
              &#10005;
            </Button>
          </div>
        ))}
      </div>
      <div className="add-row">
        <Button variant="ghost" onClick={() => workspace.addSiteItem(site.id)}>
          + Add component
        </Button>
      </div>
    </div>
  );
}
