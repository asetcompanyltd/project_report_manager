"use client";

import { useRef } from "react";
import { Upload, Download } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useConfirm } from "@/hooks/useConfirm";
import { reportService, type ImportBackupPayload } from "@/services/report";
import { useToast } from "@/context/ToastContext";
import type { Report } from "@/types/report";
import type { ReportWorkspace } from "@/hooks/useReportWorkspace";

function safeFileTitle(base: string): string {
  return (base || "Project_Status_Report").replace(/[^a-z0-9]+/gi, "_").slice(0, 80);
}

export function DataCard({ report, workspace }: { report: Report; workspace: ReportWorkspace }) {
  const showToast = useToast();
  const confirm = useConfirm();
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleExport() {
    const snapshots = await Promise.all(
      report.snapshots.map(async (s) => {
        const full = await reportService.getSnapshot(s.id);
        return { id: full.id, label: full.label, ts: full.createdAt, data: full.data };
      })
    );
    const payload = {
      data: { meta: report.meta, notes: report.notes, phases: report.phases, phaseDetails: report.phaseDetails, nextSteps: report.nextSteps },
      snapshots,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${safeFileTitle(report.meta.title)}_backup.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("Data exported");
  }

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const text = await file.text();
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      showToast("Import failed — not a valid JSON file", "error");
      return;
    }
    const body = parsed as { data?: unknown; snapshots?: unknown[] };
    if (!body || typeof body !== "object" || !body.data) {
      showToast("Import failed — file is not a recognized backup", "error");
      return;
    }
    const ok = await confirm({
      title: "Import this backup?",
      description: "This replaces your current unsaved data and versions with the contents of this file.",
      confirmLabel: "Import backup",
      danger: true,
    });
    if (!ok) return;
    await workspace.importBackup(body as ImportBackupPayload);
    showToast("Data imported");
  }

  return (
    <Card title="Data" description="Export a full backup or bring one in from another project.">
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" size="sm" onClick={handleExport}>
          <Download className="size-4" />
          Export Data (JSON)
        </Button>
        <Button variant="secondary" size="sm" onClick={handleImportClick}>
          <Upload className="size-4" />
          Import Data (JSON)
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={handleImportFile}
        />
      </div>
    </Card>
  );
}
