"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { FormField } from "@/components/ui/FormField";
import { reportService } from "@/services/report";
import { downloadWordDoc, openPrintFallback } from "@/utils/export/wordExport";
import { generatePdf } from "@/utils/export/pdfExport";
import { useToast } from "@/context/ToastContext";
import type { Report } from "@/types/report";
import type { ReportWorkspace } from "@/hooks/useReportWorkspace";

export function SnapshotsCard({ report, workspace }: { report: Report; workspace: ReportWorkspace }) {
  const showToast = useToast();
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [label, setLabel] = useState("");

  async function handleSave() {
    const name = label.trim() || `Version ${report.snapshots.length + 1}`;
    await workspace.createSnapshot(name);
    setShowSaveModal(false);
    setLabel("");
    showToast("Version saved");
  }

  async function handleLoad(snapshotId: string, snapLabel: string) {
    if (!window.confirm(`Load version "${snapLabel}"? This will replace your current unsaved data.`)) return;
    await workspace.restoreSnapshot(snapshotId);
    showToast("Version loaded");
  }

  async function handleDeleteSnapshot(snapshotId: string, snapLabel: string) {
    if (!window.confirm(`Delete version "${snapLabel}"? This cannot be undone.`)) return;
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
    showToast("Generating PDF…");
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
      hint="Snapshot the report at key milestones, and reload or export any of them later"
    >
      {report.snapshots.length === 0 ? (
        <div className="empty-note">No saved versions yet. Save one to track progress over time.</div>
      ) : (
        [...report.snapshots].reverse().map((snap) => (
          <div className="snapshot-row" key={snap.id}>
            <div className="snapshot-meta">
              <b>{snap.label}</b>
              <span className="ts">{new Date(snap.createdAt).toLocaleString()}</span>
            </div>
            <div className="snapshot-actions">
              <Button variant="ghost" onClick={() => handleLoad(snap.id, snap.label)}>
                Load
              </Button>
              <Button variant="ghost" onClick={() => handleDownloadWord(snap.id, snap.label)}>
                Download Word
              </Button>
              <Button variant="ghost" onClick={() => handleDownloadPdf(snap.id, snap.label)}>
                Download PDF
              </Button>
              <Button variant="icon" title="Delete" onClick={() => handleDeleteSnapshot(snap.id, snap.label)}>
                &#10005;
              </Button>
            </div>
          </div>
        ))
      )}
      <div className="add-row">
        <Button variant="primary" onClick={() => setShowSaveModal(true)}>
          + Save current as new version
        </Button>
      </div>

      <Modal
        open={showSaveModal}
        title="Name this version"
        onClose={() => setShowSaveModal(false)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowSaveModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave}>
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
