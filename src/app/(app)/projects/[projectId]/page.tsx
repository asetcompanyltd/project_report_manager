"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useReportWorkspace } from "@/hooks/useReportWorkspace";
import { projectsService } from "@/services/projects";
import { ApiClientError } from "@/services/apiClient";
import { useToast } from "@/context/ToastContext";
import { Button } from "@/components/ui/Button";
import { ReportMetaCard } from "@/components/report/ReportMetaCard";
import { PhasesTable } from "@/components/report/PhasesTable";
import { PhaseDetailSection } from "@/components/report/PhaseDetailSection";
import { NextStepsList } from "@/components/report/NextStepsList";
import { NotesCard } from "@/components/report/NotesCard";
import { SnapshotsCard } from "@/components/report/SnapshotsCard";
import { HistoryCard } from "@/components/report/HistoryCard";
import { DataCard } from "@/components/report/DataCard";
import { downloadWordDoc, openPrintFallback, buildPlainTextSummary } from "@/utils/export/wordExport";
import { generatePdf } from "@/utils/export/pdfExport";

export default function ProjectWorkspacePage() {
  const { projectId } = useParams<{ projectId: string }>();
  const showToast = useToast();
  const workspace = useReportWorkspace(projectId ?? null);
  const { report, loading, error } = workspace;

  const { data: project } = useQuery({
    queryKey: ["projects", projectId],
    queryFn: () => projectsService.get(projectId),
    enabled: !!projectId,
  });

  async function handleAddPhaseDetail() {
    try {
      await workspace.addPhaseDetail();
    } catch (err) {
      showToast(err instanceof ApiClientError ? err.message : "Could not add section.");
    }
  }

  function handleCopySummary() {
    if (!report) return;
    const text = buildPlainTextSummary(report);
    navigator.clipboard
      ?.writeText(text)
      .then(() => showToast("Summary copied to clipboard"))
      .catch(() => showToast("Copy failed — please select and copy manually"));
  }

  function handleDownloadWord() {
    if (!report) return;
    downloadWordDoc(report);
    showToast("Word document downloaded");
  }

  async function handleExportPdf() {
    if (!report) return;
    showToast("Generating PDF…");
    try {
      const { pdf, filename } = await generatePdf(report);
      pdf.save(filename);
      showToast("PDF downloaded");
    } catch {
      if (openPrintFallback(report)) {
        showToast("Could not auto-generate PDF — opened print dialog instead");
      }
    }
  }

  if (loading) return <div className="wrap center-loading">Loading report…</div>;
  if (error || !report) return <div className="wrap form-error">{error ?? "Report not found."}</div>;

  return (
    <div className="wrap">
      <header className="top">
        <div>
          <Link href="/projects" style={{ fontSize: 12, color: "var(--grey)" }}>
            ← All Projects
          </Link>
          <h1>{project?.name ?? "Project"} — Report Manager</h1>
          <p>Update your project status here, then export a formatted Word document or PDF.</p>
        </div>
        <div className="actions">
          <Button variant="ghost" onClick={handleCopySummary}>
            Copy Summary
          </Button>
          <Button variant="ghost" onClick={handleExportPdf}>
            Export PDF
          </Button>
          <Button variant="primary" onClick={handleDownloadWord}>
            Download Word Document
          </Button>
        </div>
      </header>

      <ReportMetaCard report={report} updateMeta={workspace.updateMeta} setLogo={workspace.setLogo} />
      <PhasesTable report={report} workspace={workspace} />

      {report.phaseDetails.map((pd, i) => (
        <PhaseDetailSection
          key={pd.id}
          phaseDetail={pd}
          index={i}
          sectionCount={report.phaseDetails.length}
          phases={report.phases}
          workspace={workspace}
        />
      ))}
      <div className="card">
        <div className="add-row" style={{ marginTop: 0 }}>
          <Button variant="primary" onClick={handleAddPhaseDetail}>
            + Add phase detail section
          </Button>
        </div>
      </div>

      <NextStepsList report={report} workspace={workspace} />
      <NotesCard report={report} workspace={workspace} />
      <SnapshotsCard report={report} workspace={workspace} />
      <HistoryCard report={report} workspace={workspace} />
      <DataCard report={report} workspace={workspace} />

      <div className="save-bar-inline">
        <span className={`save-note ${workspace.saveStatus}`}>
          {workspace.saveStatus === "saving"
            ? "Saving…"
            : workspace.saveStatus === "saved"
              ? "All changes saved"
              : workspace.saveStatus === "failed"
                ? "Save failed — check your connection"
                : ""}
        </span>
      </div>
    </div>
  );
}
