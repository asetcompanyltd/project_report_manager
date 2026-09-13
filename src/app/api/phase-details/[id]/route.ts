import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { phases, phaseDetails } from "@/db/schema";
import { requireProjectAccess } from "@/lib/authz";
import { projectIdForPhaseDetail } from "@/lib/resource-scope";
import { logChange } from "@/lib/report-service";
import { phaseDetailInputSchema } from "@/lib/validation/report";
import { ApiError, withApiErrors } from "@/lib/api-response";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  return withApiErrors(async () => {
    const { id } = await params;
    const projectId = await projectIdForPhaseDetail(id);
    await requireProjectAccess(projectId, "editor");
    const body = phaseDetailInputSchema.parse(await req.json());

    const [current] = await db.select().from(phaseDetails).where(eq(phaseDetails.id, id)).limit(1);
    if (!current) throw new ApiError(404, "NOT_FOUND", "Phase detail section not found.");

    if (body.phaseId !== undefined) {
      await db.update(phaseDetails).set({ phaseId: body.phaseId }).where(eq(phaseDetails.id, id));
      const [phase] = body.phaseId
        ? await db.select().from(phases).where(eq(phases.id, body.phaseId)).limit(1)
        : [null];
      await logChange(current.reportId, `Linked phase detail section to "${phase ? phase.name : body.phaseId}"`);
    }

    const [updated] = await db.select().from(phaseDetails).where(eq(phaseDetails.id, id)).limit(1);
    return updated;
  });
}

export async function DELETE(_req: Request, { params }: Params) {
  return withApiErrors(async () => {
    const { id } = await params;
    const projectId = await projectIdForPhaseDetail(id);
    await requireProjectAccess(projectId, "editor");

    const [current] = await db.select().from(phaseDetails).where(eq(phaseDetails.id, id)).limit(1);
    if (!current) throw new ApiError(404, "NOT_FOUND", "Phase detail section not found.");

    let label = "this section";
    if (current.phaseId) {
      const [phase] = await db.select().from(phases).where(eq(phases.id, current.phaseId)).limit(1);
      if (phase) label = phase.name;
    }

    await db.delete(phaseDetails).where(eq(phaseDetails.id, id));
    await logChange(current.reportId, `Removed phase detail section for "${label}"`);

    return { success: true };
  });
}
