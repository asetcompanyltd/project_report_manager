import { desc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { projects, projectMembers, reports } from "@/db/schema";
import { requirePermission, getEffectivePermissions } from "@/lib/permissions";
import { implicitProjectRole } from "@/lib/authz";
import { createProjectSchema } from "@/lib/validation/project";
import { ApiError, withApiErrors } from "@/lib/api-response";
import { newId } from "@/utils/id";

export async function GET() {
  return withApiErrors(async () => {
    const userId = await requirePermission("projects", "view");

    // Every account with projects:view sees every project in the system, the same way a
    // Project Manager does — an explicit project_members row (if any) overrides the role that
    // would otherwise be implied by the account's global permissions; see requireProjectAccess.
    const [allProjects, memberships, permissions] = await Promise.all([
      db.select().from(projects).orderBy(desc(projects.updatedAt)),
      db.select().from(projectMembers).where(eq(projectMembers.userId, userId)),
      getEffectivePermissions(userId),
    ]);

    const membershipRole = new Map(memberships.map((m) => [m.projectId, m.role]));
    const fallbackRole = implicitProjectRole(permissions.projects);

    return allProjects
      .map((p) => ({ ...p, role: membershipRole.get(p.id) ?? fallbackRole }))
      .filter((p): p is typeof p & { role: NonNullable<typeof p.role> } => p.role !== null);
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
