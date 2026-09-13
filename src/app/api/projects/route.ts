import { desc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { projects, projectMembers, reports } from "@/db/schema";
import { requirePermission } from "@/lib/permissions";
import { createProjectSchema } from "@/lib/validation/project";
import { ApiError, withApiErrors } from "@/lib/api-response";
import { newId } from "@/utils/id";

export async function GET() {
  return withApiErrors(async () => {
    const userId = await requirePermission("projects", "view");
    const rows = await db
      .select({ project: projects, role: projectMembers.role })
      .from(projectMembers)
      .innerJoin(projects, eq(projectMembers.projectId, projects.id))
      .where(eq(projectMembers.userId, userId))
      .orderBy(desc(projects.updatedAt));

    return rows.map((r) => ({ ...r.project, role: r.role }));
  });
}

export async function POST(req: Request) {
  return withApiErrors(async () => {
    const userId = await requirePermission("projects", "create");
    const body = createProjectSchema.parse(await req.json());
    const now = new Date().toISOString();

    const projectId = newId("proj");
    try {
      await db.transaction(async (tx) => {
        await tx.insert(projects).values({
          id: projectId,
          code: body.code,
          name: body.name,
          description: body.description ?? "",
          status: body.status ?? "Active",
          createdBy: userId,
          createdAt: now,
          updatedAt: now,
        });
        await tx.insert(projectMembers).values({
          id: newId("member"),
          projectId,
          userId,
          role: "owner",
        });
        await tx.insert(reports).values({
          id: newId("report"),
          projectId,
          updatedAt: now,
        });
      });
    } catch (err) {
      if (err instanceof Error && /UNIQUE constraint failed: projects\.code/.test(err.message)) {
        throw new ApiError(409, "CODE_TAKEN", `Project code "${body.code}" is already in use.`);
      }
      throw err;
    }

    const [created] = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
    return { ...created, role: "owner" as const };
  });
}
