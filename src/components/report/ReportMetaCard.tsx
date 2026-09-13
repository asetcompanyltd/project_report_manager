"use client";

import { useRef } from "react";
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
    <Card title="Report Details">
      <div className="grid4">
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

      <div className="logo-row">
        <div className="logo-preview">
          {report.meta.logo ? (
            // Uploaded logo is an arbitrary data: URL, not a static asset next/image can optimize.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={report.meta.logo} alt="Logo" />
          ) : (
            "No logo"
          )}
        </div>
        <Button variant="ghost" onClick={() => fileInputRef.current?.click()}>
          Upload logo
        </Button>
        {report.meta.logo && (
          <Button variant="icon" onClick={() => setLogo(null)} title="Remove logo">
            Remove
          </Button>
        )}
        <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
      </div>

      <div className="overall">
        <span>Overall Project Progress (auto-calculated from phase progress below)</span>
        <div className="overall-track">
          <div className="overall-fill" style={{ width: `${overall}%` }} />
        </div>
        <b>{overall}% Complete</b>
      </div>
    </Card>
  );
}
