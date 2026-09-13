"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ClipboardCopy, FileDown, FileText, Loader2, CheckCircle2, AlertCircle, Plus } from "lucide-react";
import { useReportWorkspace } from "@/hooks/useReportWorkspace";
import { projectsService } from "@/services/projects";
import { ApiClientError } from "@/services/apiClient";
import { useToast } from "@/context/ToastContext";
import { Button } from "@/components/ui/Button";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { WorkspaceSkeleton } from "@/components/ui/Skeleton";
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
      showToast(err instanceof ApiClientError ? err.message : "Could not add section.", "error");
    }
  }

  function handleCopySummary() {
    if (!report) return;
    const text = buildPlainTextSummary(report);
    navigator.clipboard
      ?.writeText(text)
      .then(() => showToast("Summary copied to clipboard"))
      .catch(() => showToast("Copy failed — please select and copy manually", "error"));
  }

  function handleDownloadWord() {
    if (!report) return;
    downloadWordDoc(report);
    showToast("Word document downloaded");
  }

  async function handleExportPdf() {
    if (!report) return;
    showToast("Generating PDF…", "info");
    try {
      const { pdf, filename } = await generatePdf(report);
      pdf.save(filename);
      showToast("PDF downloaded");
    } catch {
      if (openPrintFallback(report)) {
        showToast("Could not auto-generate PDF — opened print dialog instead", "info");
      }
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: "Dashboard", href: "/projects" }, { label: "Loading…" }]} />
        <WorkspaceSkeleton />
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {error ?? "Report not found."}
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <Breadcrumbs items={[{ label: "Dashboard", href: "/projects" }, { label: project?.name ?? "Project" }]} />

      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{project?.name ?? "Project"}</h1>
          <p className="mt-1 text-sm text-slate-500">Update your project status here, then export a formatted Word document or PDF.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={handleCopySummary}>
            <ClipboardCopy className="size-4" />
            Copy Summary
          </Button>
          <Button variant="secondary" onClick={handleExportPdf}>
            <FileDown className="size-4" />
            Export PDF
          </Button>
          <Button variant="primary" onClick={handleDownloadWord}>
            <FileText className="size-4" />
            Download Word
          </Button>
        </div>
      </header>

      <ReportMetaCard report={report} updateMeta={workspace.updateMeta} setLogo={workspace.setLogo} />
      <PhasesTable report={report} workspace={workspace} />

      <div className="space-y-4">
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
        <button
          onClick={handleAddPhaseDetail}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-white py-4 text-sm font-semibold text-slate-500 transition-colors hover:border-indigo-400 hover:text-indigo-600"
        >
          <Plus className="size-4" />
          Add phase detail section
        </button>
      </div>

      <NextStepsList report={report} workspace={workspace} />
      <NotesCard report={report} workspace={workspace} />
      <SnapshotsCard report={report} workspace={workspace} />
      <HistoryCard report={report} workspace={workspace} />
      <DataCard report={report} workspace={workspace} />

      <div className="flex justify-end">
        <SaveStatusPill status={workspace.saveStatus} />
      </div>
    </div>
  );
}

function SaveStatusPill({ status }: { status: "idle" | "saving" | "saved" | "failed" }) {
  if (status === "idle") return null;
  const config = {
    saving: { icon: Loader2, text: "Saving…", classes: "bg-slate-100 text-slate-500", spin: true },
    saved: { icon: CheckCircle2, text: "All changes saved", classes: "bg-emerald-50 text-emerald-700", spin: false },
    failed: { icon: AlertCircle, text: "Save failed — check your connection", classes: "bg-red-50 text-red-700", spin: false },
  }[status];
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${config.classes}`}>
      <Icon className={`size-3.5 ${config.spin ? "animate-spin" : ""}`} />
      {config.text}
    </span>
  );
}
