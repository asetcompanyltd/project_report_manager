import { eq, asc, desc, inArray } from "drizzle-orm";
import { db } from "@/db/client";
import {
  reports,
  phases,
  phaseDetails,
  sites,
  siteItems,
  nextSteps,
  changeLog,
  snapshots,
  type ItemStatus,
} from "@/db/schema";
import { ApiError } from "./api-response";
import { newId } from "@/utils/id";

export async function getReportByProjectId(projectId: string) {
  const [report] = await db.select().from(reports).where(eq(reports.projectId, projectId)).limit(1);
  if (!report) throw new ApiError(404, "NOT_FOUND", "Report not found for this project.");
  return report;
}

/** Appends a change-log entry and trims history to the most recent 60 entries (mirrors the legacy tool). */
export async function logChange(reportId: string, message: string) {
  await db.insert(changeLog).values({ id: newId("log"), reportId, message });
  const rows = await db
    .select({ id: changeLog.id })
    .from(changeLog)
    .where(eq(changeLog.reportId, reportId))
    .orderBy(desc(changeLog.ts));
  if (rows.length > 60) {
    for (const r of rows.slice(60)) {
      await db.delete(changeLog).where(eq(changeLog.id, r.id));
    }
  }
}

export async function getFullReport(projectId: string) {
  const report = await getReportByProjectId(projectId);
  const reportId = report.id;

  const [phaseRows, phaseDetailRows, nextStepRows, logRows, snapshotRows] = await Promise.all([
    db.select().from(phases).where(eq(phases.reportId, reportId)).orderBy(asc(phases.sortOrder)),
    db.select().from(phaseDetails).where(eq(phaseDetails.reportId, reportId)).orderBy(asc(phaseDetails.sortOrder)),
    db.select().from(nextSteps).where(eq(nextSteps.reportId, reportId)).orderBy(asc(nextSteps.sortOrder)),
    db.select().from(changeLog).where(eq(changeLog.reportId, reportId)).orderBy(desc(changeLog.ts)),
    db.select().from(snapshots).where(eq(snapshots.reportId, reportId)).orderBy(asc(snapshots.createdAt)),
  ]);

  const phaseDetailIds = phaseDetailRows.map((pd) => pd.id);
  const siteRows = phaseDetailIds.length
    ? await db.select().from(sites).where(inArray(sites.phaseDetailId, phaseDetailIds)).orderBy(asc(sites.sortOrder))
    : [];
  const siteIds = siteRows.map((s) => s.id);
  const itemRows = siteIds.length
    ? await db.select().from(siteItems).where(inArray(siteItems.siteId, siteIds)).orderBy(asc(siteItems.sortOrder))
    : [];

  const sitesByPhaseDetail = new Map<string, typeof siteRows>();
  for (const s of siteRows) {
    const list = sitesByPhaseDetail.get(s.phaseDetailId) ?? [];
    list.push(s);
    sitesByPhaseDetail.set(s.phaseDetailId, list);
  }
  const itemsBySite = new Map<string, typeof itemRows>();
  for (const it of itemRows) {
    const list = itemsBySite.get(it.siteId) ?? [];
    list.push(it);
    itemsBySite.set(it.siteId, list);
  }

  return {
    id: reportId,
    meta: {
      title: report.title,
      subtitle: report.subtitle,
      reportDate: report.reportDate,
      preparedBy: report.preparedBy,
      logo: report.logo,
    },
    notes: report.notes,
    phases: phaseRows.map((p) => ({
      id: p.id,
      name: p.name,
      status: p.status,
      progress: p.progress,
      targetDate: p.targetDate,
      remarks: p.remarks,
    })),
    phaseDetails: phaseDetailRows.map((pd) => ({
      id: pd.id,
      phaseId: pd.phaseId,
      sites: (sitesByPhaseDetail.get(pd.id) ?? []).map((s) => ({
        id: s.id,
        name: s.name,
        status: s.status,
        progress: s.progress,
        targetDate: s.targetDate,
        items: (itemsBySite.get(s.id) ?? []).map((it) => ({ id: it.id, text: it.text })),
      })),
    })),
    nextSteps: nextStepRows.map((n) => ({ id: n.id, text: n.text })),
    changeLog: logRows.map((l) => ({ id: l.id, ts: l.ts, message: l.message })),
    snapshots: snapshotRows.map((s) => ({ id: s.id, label: s.label, createdAt: s.createdAt })),
  };
}

export type ReportPayload = Awaited<ReturnType<typeof getFullReport>>;

/** Captures the current live report as a self-contained, re-importable JSON payload. */
export async function buildSnapshotPayload(projectId: string) {
  const full = await getFullReport(projectId);
  return {
    meta: full.meta,
    notes: full.notes,
    phases: full.phases,
    phaseDetails: full.phaseDetails,
    nextSteps: full.nextSteps,
  };
}

interface ImportPhase {
  id?: string;
  name?: string;
  status?: string;
  progress?: number;
  targetDate?: string;
  remarks?: string;
}
interface ImportSite {
  name?: string;
  status?: string;
  progress?: number;
  targetDate?: string;
  items?: unknown[];
}
interface ImportPhaseDetail {
  phaseId?: string | null;
  sites?: ImportSite[];
}
export interface ImportPayload {
  meta?: { title?: string; subtitle?: string; reportDate?: string; preparedBy?: string; logo?: string | null };
  phases?: ImportPhase[];
  phaseDetails?: ImportPhaseDetail[];
  nextSteps?: unknown[];
  notes?: string;
}

function textOf(raw: unknown): string {
  if (typeof raw === "string") return raw;
  if (raw && typeof raw === "object" && "text" in raw) return String((raw as { text?: unknown }).text ?? "");
  return "";
}

/**
 * Wipes and rewrites a project's report content from a payload shaped like the legacy
 * tool's data export. Used by both "restore snapshot" and "import JSON backup" — the two
 * places old, browser-only data can re-enter the system (see plan's migration-risk #5).
 */
export async function replaceReportContent(projectId: string, payload: ImportPayload) {
  const report = await getReportByProjectId(projectId);
  const reportId = report.id;

  await db.transaction(async (tx) => {
    await tx.delete(phaseDetails).where(eq(phaseDetails.reportId, reportId));
    await tx.delete(phases).where(eq(phases.reportId, reportId));
    await tx.delete(nextSteps).where(eq(nextSteps.reportId, reportId));

    if (payload.meta) {
      await tx
        .update(reports)
        .set({
          title: payload.meta.title ?? report.title,
          subtitle: payload.meta.subtitle ?? report.subtitle,
          reportDate: payload.meta.reportDate ?? report.reportDate,
          preparedBy: payload.meta.preparedBy ?? report.preparedBy,
          logo: payload.meta.logo === undefined ? report.logo : payload.meta.logo,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(reports.id, reportId));
    }
    if (payload.notes !== undefined) {
      await tx.update(reports).set({ notes: payload.notes }).where(eq(reports.id, reportId));
    }

    const phaseIdMap = new Map<string, string>();
    const newPhases = payload.phases ?? [];
    for (let i = 0; i < newPhases.length; i++) {
      const p = newPhases[i];
      const rowId = newId("phase");
      if (p.id) phaseIdMap.set(p.id, rowId);
      await tx.insert(phases).values({
        id: rowId,
        reportId,
        name: p.name ?? "",
        status: (p.status as ItemStatus) ?? "Not Started",
        progress: p.progress ?? 0,
        targetDate: p.targetDate ?? "",
        remarks: p.remarks ?? "",
        sortOrder: i,
      });
    }

    const newPhaseDetails = payload.phaseDetails ?? [];
    for (let i = 0; i < newPhaseDetails.length; i++) {
      const pd = newPhaseDetails[i];
      const pdId = newId("pd");
      const mappedPhaseId = pd.phaseId ? phaseIdMap.get(pd.phaseId) ?? null : null;
      await tx.insert(phaseDetails).values({ id: pdId, reportId, phaseId: mappedPhaseId, sortOrder: i });

      const sitesArr = pd.sites ?? [];
      for (let si = 0; si < sitesArr.length; si++) {
        const s = sitesArr[si];
        const siteId = newId("site");
        await tx.insert(sites).values({
          id: siteId,
          phaseDetailId: pdId,
          name: s.name ?? "",
          status: (s.status as ItemStatus) ?? "Not Started",
          progress: s.progress ?? 0,
          targetDate: s.targetDate ?? "",
          sortOrder: si,
        });
        const itemsArr = s.items ?? [];
        for (let ii = 0; ii < itemsArr.length; ii++) {
          await tx.insert(siteItems).values({ id: newId("item"), siteId, text: textOf(itemsArr[ii]), sortOrder: ii });
        }
      }
    }

    const stepsArr = payload.nextSteps ?? [];
    for (let i = 0; i < stepsArr.length; i++) {
      await tx.insert(nextSteps).values({ id: newId("step"), reportId, text: textOf(stepsArr[i]), sortOrder: i });
    }
  });
}
