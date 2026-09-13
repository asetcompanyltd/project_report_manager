"use client";

import { useState } from "react";
import { Download, FileText, History, Plus, RotateCcw, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { FormField } from "@/components/ui/FormField";
import { EmptyState } from "@/components/ui/EmptyState";
import { Tooltip } from "@/components/ui/Tooltip";
import { useConfirm } from "@/hooks/useConfirm";
import { reportService } from "@/services/report";
import { downloadWordDoc, openPrintFallback } from "@/utils/export/wordExport";
import { generatePdf } from "@/utils/export/pdfExport";
import { useToast } from "@/context/ToastContext";
import type { Report } from "@/types/report";
import type { ReportWorkspace } from "@/hooks/useReportWorkspace";

export function SnapshotsCard({ report, workspace }: { report: Report; workspace: ReportWorkspace }) {
  const showToast = useToast();
  const confirm = useConfirm();
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [label, setLabel] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    const name = label.trim() || `Version ${report.snapshots.length + 1}`;
    setSaving(true);
    try {
      await workspace.createSnapshot(name);
      setShowSaveModal(false);
      setLabel("");
      showToast("Version saved");
    } finally {
      setSaving(false);
    }
  }

  async function handleLoad(snapshotId: string, snapLabel: string) {
    const ok = await confirm({
      title: `Load version "${snapLabel}"?`,
      description: "This replaces your current unsaved data with this version's content.",
      confirmLabel: "Load version",
    });
    if (!ok) return;
    await workspace.restoreSnapshot(snapshotId);
    showToast("Version loaded");
  }

  async function handleDeleteSnapshot(snapshotId: string, snapLabel: string) {
    const ok = await confirm({
      title: `Delete version "${snapLabel}"?`,
      description: "This cannot be undone.",
      confirmLabel: "Delete version",
      danger: true,
    });
    if (!ok) return;
    await workspace.deleteSnapshot(snapshotId);
    showToast("Version deleted");
  }

  async function handleDownloadWord(snapshotId: string, snapLabel: string) {
    const snap = await reportService.getSnapshot(snapshotId);
    downloadWordDoc(snap.data, snapLabel);
    showToast("Word document downloaded");
  }

  async function handleDownloadPdf(snapshotId: string, snapLabel: string) {
    const snap = await reportService.getSnapshot(snapshotId);
    showToast("Generating PDF…", "info");
    try {
      const { pdf, filename } = await generatePdf(snap.data, snapLabel);
      pdf.save(filename);
      showToast("PDF downloaded");
    } catch {
      openPrintFallback(snap.data);
    }
  }

  return (
    <Card
      title="Saved Versions"
      description="Snapshot the report at key milestones, and reload or export any of them later."
      actions={
        <Button variant="primary" size="sm" onClick={() => setShowSaveModal(true)}>
          <Plus className="size-4" />
          Save version
        </Button>
      }
    >
      {report.snapshots.length === 0 ? (
        <EmptyState compact icon={History} title="No saved versions yet" description="Save one to track progress over time." />
      ) : (
        <div className="space-y-2">
          {[...report.snapshots].reverse().map((snap) => (
            <div
              key={snap.id}
              className="flex flex-col gap-3 rounded-lg border border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-800">{snap.label}</p>
                <p className="text-xs text-slate-400">{new Date(snap.createdAt).toLocaleString()}</p>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <Tooltip label="Load this version">
                  <Button variant="ghost" size="sm" onClick={() => handleLoad(snap.id, snap.label)}>
                    <RotateCcw className="size-3.5" />
                    Load
                  </Button>
                </Tooltip>
                <Tooltip label="Download as Word">
                  <Button variant="ghost" size="sm" onClick={() => handleDownloadWord(snap.id, snap.label)}>
                    <FileText className="size-3.5" />
                    Word
                  </Button>
                </Tooltip>
                <Tooltip label="Download as PDF">
                  <Button variant="ghost" size="sm" onClick={() => handleDownloadPdf(snap.id, snap.label)}>
                    <Download className="size-3.5" />
                    PDF
                  </Button>
                </Tooltip>
                <Tooltip label="Delete version">
                  <Button
                    variant="icon"
                    size="sm"
                    onClick={() => handleDeleteSnapshot(snap.id, snap.label)}
                    aria-label="Delete version"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </Tooltip>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={showSaveModal}
        title="Name this version"
        description="Give this snapshot a memorable label so you can find it later."
        onClose={() => setShowSaveModal(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowSaveModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave} loading={saving}>
              Save
            </Button>
          </>
        }
      >
        <FormField label="Version name">
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. Week 12 update"
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
          />
        </FormField>
      </Modal>
    </Card>
  );
}
