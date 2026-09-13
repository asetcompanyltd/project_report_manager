import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { reports, phases, phaseDetails, sites, siteItems, nextSteps, snapshots } from "@/db/schema";
import { ApiError } from "./api-response";

function firstOrNotFound<T>(rows: T[]): T {
  const [row] = rows;
  if (!row) throw new ApiError(404, "NOT_FOUND", "Resource not found.");
  return row;
}

/**
 * Resolvers that walk a nested resource's foreign keys back up to its owning project id,
 * so routes addressed by a bare resource id (e.g. PATCH /api/phases/:id) can still be
 * checked against requireProjectAccess before any read or write happens.
 */
export async function projectIdForReport(reportId: string): Promise<string> {
  const row = firstOrNotFound(
    await db.select({ projectId: reports.projectId }).from(reports).where(eq(reports.id, reportId))
  );
  return row.projectId;
}

export async function projectIdForPhase(phaseId: string): Promise<string> {
  const row = firstOrNotFound(
    await db
      .select({ projectId: reports.projectId })
      .from(phases)
      .innerJoin(reports, eq(phases.reportId, reports.id))
      .where(eq(phases.id, phaseId))
  );
  return row.projectId;
}

export async function projectIdForPhaseDetail(phaseDetailId: string): Promise<string> {
  const row = firstOrNotFound(
    await db
      .select({ projectId: reports.projectId })
      .from(phaseDetails)
      .innerJoin(reports, eq(phaseDetails.reportId, reports.id))
      .where(eq(phaseDetails.id, phaseDetailId))
  );
  return row.projectId;
}

export async function projectIdForSite(siteId: string): Promise<string> {
  const row = firstOrNotFound(
    await db
      .select({ projectId: reports.projectId })
      .from(sites)
      .innerJoin(phaseDetails, eq(sites.phaseDetailId, phaseDetails.id))
      .innerJoin(reports, eq(phaseDetails.reportId, reports.id))
      .where(eq(sites.id, siteId))
  );
  return row.projectId;
}

export async function projectIdForSiteItem(siteItemId: string): Promise<string> {
  const row = firstOrNotFound(
    await db
      .select({ projectId: reports.projectId })
      .from(siteItems)
      .innerJoin(sites, eq(siteItems.siteId, sites.id))
      .innerJoin(phaseDetails, eq(sites.phaseDetailId, phaseDetails.id))
      .innerJoin(reports, eq(phaseDetails.reportId, reports.id))
      .where(eq(siteItems.id, siteItemId))
  );
  return row.projectId;
}

export async function projectIdForNextStep(nextStepId: string): Promise<string> {
  const row = firstOrNotFound(
    await db
      .select({ projectId: reports.projectId })
      .from(nextSteps)
      .innerJoin(reports, eq(nextSteps.reportId, reports.id))
      .where(eq(nextSteps.id, nextStepId))
  );
  return row.projectId;
}

export async function projectIdForSnapshot(snapshotId: string): Promise<string> {
  const row = firstOrNotFound(
    await db
      .select({ projectId: reports.projectId })
      .from(snapshots)
      .innerJoin(reports, eq(snapshots.reportId, reports.id))
      .where(eq(snapshots.id, snapshotId))
  );
  return row.projectId;
}
