"use client";

import { useRef } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { computeOverallProgress } from "@/utils/status";
import type { Report, ReportMeta } from "@/types/report";

export function ReportMetaCard({
  report,
  updateMeta,
  setLogo,
}: {
  report: Report;
  updateMeta: (patch: Partial<ReportMeta>) => void;
  setLogo: (logo: string | null) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const overall = computeOverallProgress(report.phases);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setLogo(reader.result as string);
    reader.readAsDataURL(file);
  }

  return (
    <Card title="Report Details" description="These fields appear on the exported Word/PDF report.">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <FormField label="Report Title">
          <input type="text" value={report.meta.title} onChange={(e) => updateMeta({ title: e.target.value })} />
        </FormField>
        <FormField label="Subtitle">
          <input type="text" value={report.meta.subtitle} onChange={(e) => updateMeta({ subtitle: e.target.value })} />
        </FormField>
        <FormField label="Report Date">
          <input type="date" value={report.meta.reportDate} onChange={(e) => updateMeta({ reportDate: e.target.value })} />
        </FormField>
        <FormField label="Prepared By">
          <input type="text" value={report.meta.preparedBy} onChange={(e) => updateMeta({ preparedBy: e.target.value })} />
        </FormField>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-dashed border-slate-300 bg-slate-50 text-[11px] text-slate-400">
          {report.meta.logo ? (
            // Uploaded logo is an arbitrary data: URL, not a static asset next/image can optimize.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={report.meta.logo} alt="Logo" className="size-full object-contain" />
          ) : (
            "No logo"
          )}
        </div>
        <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
          <ImagePlus className="size-4" />
          Upload logo
        </Button>
        {report.meta.logo && (
          <Button variant="ghost" size="sm" onClick={() => setLogo(null)}>
            <Trash2 className="size-4" />
            Remove
          </Button>
        )}
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>

      <div className="mt-5 flex flex-col gap-3 rounded-lg bg-indigo-50 px-4 py-3.5 sm:flex-row sm:items-center">
        <span className="text-sm font-medium text-indigo-900">
          Overall Progress <span className="font-normal text-indigo-600">(auto-calculated from phases below)</span>
        </span>
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/70">
          <div className="h-full rounded-full bg-indigo-600 transition-all" style={{ width: `${overall}%` }} />
        </div>
        <b className="text-sm font-bold text-indigo-900">{overall}% Complete</b>
      </div>
    </Card>
  );
}
