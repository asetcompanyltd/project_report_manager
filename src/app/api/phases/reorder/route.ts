import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { phases } from "@/db/schema";
import { requireProjectAccess } from "@/lib/authz";
import { projectIdForPhase } from "@/lib/resource-scope";
import { computeReorderSwap } from "@/lib/reorder";
import { reorderSchema } from "@/lib/validation/report";
import { withApiErrors } from "@/lib/api-response";

export async function POST(req: Request) {
  return withApiErrors(async () => {
    const body = reorderSchema.parse(await req.json());
    const projectId = await projectIdForPhase(body.id);
    await requireProjectAccess(projectId, "editor");

    const [current] = await db.select().from(phases).where(eq(phases.id, body.id)).limit(1);
    if (!current) return { success: true };

    const siblings = await db.select().from(phases).where(eq(phases.reportId, current.reportId));
    const swap = computeReorderSwap(siblings, body.id, body.direction);
    if (!swap) return { success: true };

    const [a, b] = swap;
    await db.transaction(async (tx) => {
      await tx.update(phases).set({ sortOrder: b.sortOrder }).where(eq(phases.id, a.id));
      await tx.update(phases).set({ sortOrder: a.sortOrder }).where(eq(phases.id, b.id));
    });

    return { success: true };
  });
}
