import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { projects } from "@/db/schema";
import { requireProjectAccess } from "@/lib/authz";
import { updateProjectSchema } from "@/lib/validation/project";
import { ApiError, withApiErrors } from "@/lib/api-response";

type Params = { params: Promise<{ projectId: string }> };

export async function GET(_req: Request, { params }: Params) {
  return withApiErrors(async () => {
    const { projectId } = await params;
    const { role } = await requireProjectAccess(projectId, "viewer");
    const [project] = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
    if (!project) throw new ApiError(404, "NOT_FOUND", "Project not found.");
    return { ...project, role };
  });
}

export async function PATCH(req: Request, { params }: Params) {
  return withApiErrors(async () => {
    const { projectId } = await params;
    await requireProjectAccess(projectId, "editor");
    const body = updateProjectSchema.parse(await req.json());

    try {
      await db
        .update(projects)
        .set({ ...body, updatedAt: new Date().toISOString() })
        .where(eq(projects.id, projectId));
    } catch (err) {
      if (err instanceof Error && /UNIQUE constraint failed: projects\.code/.test(err.message)) {
        throw new ApiError(409, "CODE_TAKEN", `Project code "${body.code}" is already in use.`);
      }
      throw err;
    }

    const [updated] = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
    return updated;
  });
}

export async function DELETE(_req: Request, { params }: Params) {
  return withApiErrors(async () => {
    const { projectId } = await params;
    await requireProjectAccess(projectId, "owner");
    await db.delete(projects).where(eq(projects.id, projectId));
    return { success: true };
  });
}
