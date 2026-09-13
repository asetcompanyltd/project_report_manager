"use client";

import { ArrowUp, ArrowDown, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Tooltip } from "@/components/ui/Tooltip";
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
    <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex gap-0.5 pb-2">
          <Tooltip label="Move up">
            <Button
              variant="icon"
              size="sm"
              disabled={index === 0}
              onClick={() => workspace.reorderSite(site.id, "up")}
              aria-label="Move up"
            >
              <ArrowUp className="size-3.5" />
            </Button>
          </Tooltip>
          <Tooltip label="Move down">
            <Button
              variant="icon"
              size="sm"
              disabled={index === siteCount - 1}
              onClick={() => workspace.reorderSite(site.id, "down")}
              aria-label="Move down"
            >
              <ArrowDown className="size-3.5" />
            </Button>
          </Tooltip>
        </div>
        <FormField label="Site Name" className="min-w-[160px] flex-[2]">
          <input
            type="text"
            value={site.name}
            onChange={(e) => workspace.updateSiteField(phaseDetail.id, site.id, "name", e.target.value)}
          />
        </FormField>
        <FormField label="Status" className="min-w-[130px] flex-1">
          <StatusSelect value={site.status} onChange={(status) => workspace.updateSiteStatus(phaseDetail.id, site.id, status)} />
        </FormField>
        <FormField label="Progress %" className="min-w-[90px] flex-1">
          <input
            type="number"
            min={0}
            max={100}
            value={site.progress}
            onChange={(e) => workspace.updateSiteProgress(phaseDetail.id, site.id, Number(e.target.value))}
          />
        </FormField>
        <FormField label="Target Completion" className="min-w-[140px] flex-1">
          <input
            type="text"
            value={site.targetDate}
            placeholder="date or Completed"
            onChange={(e) => workspace.updateSiteField(phaseDetail.id, site.id, "targetDate", e.target.value)}
          />
          <OverdueBadge show={overdue} />
        </FormField>
        <Tooltip label="Remove site">
          <Button variant="icon" size="sm" onClick={() => workspace.removeSite(site.id)} aria-label="Remove site" className="mb-2">
            <Trash2 className="size-4" />
          </Button>
        </Tooltip>
      </div>

      <div className="mt-3 space-y-2">
        {site.items.map((item) => (
          <div className="flex items-center gap-2" key={item.id}>
            <input
              type="text"
              value={item.text}
              onChange={(e) => workspace.updateSiteItem(phaseDetail.id, site.id, item.id, e.target.value)}
            />
            <Tooltip label="Remove component">
              <Button
                variant="icon"
                size="sm"
                onClick={() => workspace.removeSiteItem(item.id)}
                aria-label="Remove component"
              >
                <Trash2 className="size-4" />
              </Button>
            </Tooltip>
          </div>
        ))}
      </div>
      <div className="mt-3">
        <Button variant="ghost" size="sm" onClick={() => workspace.addSiteItem(site.id)}>
          <Plus className="size-4" />
          Add component
        </Button>
      </div>
    </div>
  );
}
