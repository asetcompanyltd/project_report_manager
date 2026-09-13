import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { snapshots } from "@/db/schema";
import { requireProjectAccess } from "@/lib/authz";
import { projectIdForSnapshot } from "@/lib/resource-scope";
import { ApiError, withApiErrors } from "@/lib/api-response";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  return withApiErrors(async () => {
    const { id } = await params;
    const projectId = await projectIdForSnapshot(id);
    await requireProjectAccess(projectId, "viewer");
    const [snap] = await db.select().from(snapshots).where(eq(snapshots.id, id)).limit(1);
    if (!snap) throw new ApiError(404, "NOT_FOUND", "Version not found.");
    return snap;
  });
}

export async function DELETE(_req: Request, { params }: Params) {
  return withApiErrors(async () => {
    const { id } = await params;
    const projectId = await projectIdForSnapshot(id);
    await requireProjectAccess(projectId, "editor");

    const [snap] = await db.select().from(snapshots).where(eq(snapshots.id, id)).limit(1);
    if (!snap) throw new ApiError(404, "NOT_FOUND", "Version not found.");

    await db.delete(snapshots).where(eq(snapshots.id, id));

    return { success: true };
  });
}
