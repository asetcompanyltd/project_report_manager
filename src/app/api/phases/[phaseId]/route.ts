import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { phases, phaseDetails } from "@/db/schema";
import { requireProjectAccess } from "@/lib/authz";
import { projectIdForPhase } from "@/lib/resource-scope";
import { logChange } from "@/lib/report-service";
import { phaseInputSchema } from "@/lib/validation/report";
import { autoStatusFromProgress } from "@/utils/status";
import { fmtDate } from "@/utils/date";
import { ApiError, withApiErrors } from "@/lib/api-response";

type Params = { params: Promise<{ phaseId: string }> };

export async function PATCH(req: Request, { params }: Params) {
  return withApiErrors(async () => {
    const { phaseId } = await params;
    const projectId = await projectIdForPhase(phaseId);
    await requireProjectAccess(projectId, "editor");

    const body = phaseInputSchema.parse(await req.json());
    const [current] = await db.select().from(phases).where(eq(phases.id, phaseId)).limit(1);
    if (!current) throw new ApiError(404, "NOT_FOUND", "Phase not found.");

    const patch: Partial<typeof current> = { ...body };
    if (body.progress !== undefined) {
      patch.status = autoStatusFromProgress(body.progress);
    }

    await db.update(phases).set(patch).where(eq(phases.id, phaseId));
    const name = body.name ?? current.name;

    if (body.progress !== undefined) {
      await logChange(current.reportId, `Phase "${name}" progress set to ${body.progress}% (status: ${patch.status})`);
    } else if (body.status !== undefined) {
      await logChange(current.reportId, `Phase "${name}" status manually set to ${body.status}`);
    } else if (body.targetDate !== undefined) {
      await logChange(current.reportId, `Phase "${name}" target date changed to ${fmtDate(body.targetDate)}`);
    }

    const [updated] = await db.select().from(phases).where(eq(phases.id, phaseId)).limit(1);
    return updated;
  });
}

export async function DELETE(req: Request, { params }: Params) {
  return withApiErrors(async () => {
    const { phaseId } = await params;
    const projectId = await projectIdForPhase(phaseId);
    await requireProjectAccess(projectId, "editor");

    const [phase] = await db.select().from(phases).where(eq(phases.id, phaseId)).limit(1);
    if (!phase) throw new ApiError(404, "NOT_FOUND", "Phase not found.");

    const attached = await db
      .select({ id: phaseDetails.id })
      .from(phaseDetails)
      .where(eq(phaseDetails.phaseId, phaseId));

    const url = new URL(req.url);
    const cascade = url.searchParams.get("cascade") === "true";
    if (attached.length && !cascade) {
      throw new ApiError(
        409,
        "HAS_ATTACHED_SECTIONS",
        `Phase "${phase.name}" has ${attached.length} attached site detail section(s). Retry with ?cascade=true to remove them too.`
      );
    }

    // Delete attached phase-details BEFORE the phase itself: the FK is ON DELETE SET NULL,
    // so deleting the phase first would null out phaseId on those rows and this filter
    // would then match nothing.
    await db.transaction(async (tx) => {
      if (attached.length) {
        await tx.delete(phaseDetails).where(eq(phaseDetails.phaseId, phaseId));
      }
      await tx.delete(phases).where(eq(phases.id, phaseId));
    });

    await logChange(phase.reportId, `Removed phase "${phase.name}"`);
    if (attached.length) {
      await logChange(
        phase.reportId,
        `Removed ${attached.length} site detail ${attached.length === 1 ? "section" : "sections"} attached to "${phase.name}"`
      );
    }

    return { success: true, removedSections: attached.length };
  });
}
