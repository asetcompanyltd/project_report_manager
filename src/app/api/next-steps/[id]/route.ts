import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { nextSteps } from "@/db/schema";
import { requireProjectAccess } from "@/lib/authz";
import { projectIdForNextStep } from "@/lib/resource-scope";
import { nextStepInputSchema } from "@/lib/validation/report";
import { ApiError, withApiErrors } from "@/lib/api-response";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  return withApiErrors(async () => {
    const { id } = await params;
    const projectId = await projectIdForNextStep(id);
    await requireProjectAccess(projectId, "editor");
    const body = nextStepInputSchema.parse(await req.json());

    const [current] = await db.select().from(nextSteps).where(eq(nextSteps.id, id)).limit(1);
    if (!current) throw new ApiError(404, "NOT_FOUND", "Next step not found.");

    await db.update(nextSteps).set(body).where(eq(nextSteps.id, id));
    const [updated] = await db.select().from(nextSteps).where(eq(nextSteps.id, id)).limit(1);
    return updated;
  });
}

export async function DELETE(_req: Request, { params }: Params) {
  return withApiErrors(async () => {
    const { id } = await params;
    const projectId = await projectIdForNextStep(id);
    await requireProjectAccess(projectId, "editor");
    await db.delete(nextSteps).where(eq(nextSteps.id, id));
    return { success: true };
  });
}
