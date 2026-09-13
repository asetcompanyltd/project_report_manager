import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { phases, phaseDetails, sites, siteItems } from "@/db/schema";
import { requireProjectAccess } from "@/lib/authz";
import { getReportByProjectId, logChange } from "@/lib/report-service";
import { nextSortOrder } from "@/lib/reorder";
import { ApiError, withApiErrors } from "@/lib/api-response";
import { newId } from "@/utils/id";

type Params = { params: Promise<{ projectId: string }> };

export async function POST(_req: Request, { params }: Params) {
  return withApiErrors(async () => {
    const { projectId } = await params;
    await requireProjectAccess(projectId, "editor");
    const report = await getReportByProjectId(projectId);

    const reportPhases = await db.select().from(phases).where(eq(phases.reportId, report.id));
    if (!reportPhases.length) {
      throw new ApiError(400, "NO_PHASES", "Add a phase in Project Phase Status first.");
    }

    const existingDetails = await db
      .select({ phaseId: phaseDetails.phaseId, sortOrder: phaseDetails.sortOrder })
      .from(phaseDetails)
      .where(eq(phaseDetails.reportId, report.id));

    const usedIds = new Set(existingDetails.map((d) => d.phaseId));
    const nextPhase = reportPhases.find((p) => !usedIds.has(p.id)) ?? reportPhases[0];

    const pdId = newId("pd");
    await db.transaction(async (tx) => {
      await tx.insert(phaseDetails).values({
        id: pdId,
        reportId: report.id,
        phaseId: nextPhase.id,
        sortOrder: nextSortOrder(existingDetails),
      });
      const siteId = newId("site");
      await tx.insert(sites).values({
        id: siteId,
        phaseDetailId: pdId,
        name: "New Site",
        status: "Not Started",
        progress: 0,
        targetDate: "",
        sortOrder: 0,
      });
      await tx.insert(siteItems).values({ id: newId("item"), siteId, text: "New component", sortOrder: 0 });
    });

    await logChange(report.id, `Added phase detail section for "${nextPhase.name}"`);

    const [created] = await db.select().from(phaseDetails).where(eq(phaseDetails.id, pdId)).limit(1);
    return created;
  });
}
