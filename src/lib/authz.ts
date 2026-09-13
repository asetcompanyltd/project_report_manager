import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { projectMembers, type ProjectRole } from "@/db/schema";
import { getCurrentUserId } from "./session";
import { ApiError } from "./api-response";

const ROLE_RANK: Record<ProjectRole, number> = { viewer: 0, editor: 1, owner: 2 };

export async function requireUserId(): Promise<string> {
  const userId = await getCurrentUserId();
  if (!userId) throw new ApiError(401, "UNAUTHENTICATED", "You must be logged in.");
  return userId;
}

/**
 * The single choke point for project data isolation: every API route that touches
 * project-scoped data must resolve the project id and call this before reading/writing.
 * Returns 404 (not 403) for non-members so a project's existence isn't leaked either.
 */
export async function requireProjectAccess(projectId: string, minRole: ProjectRole = "viewer") {
  const userId = await requireUserId();
  const [membership] = await db
    .select()
    .from(projectMembers)
    .where(and(eq(projectMembers.projectId, projectId), eq(projectMembers.userId, userId)))
    .limit(1);

  if (!membership) throw new ApiError(404, "NOT_FOUND", "Project not found.");
  if (ROLE_RANK[membership.role] < ROLE_RANK[minRole]) {
    throw new ApiError(403, "FORBIDDEN", `This action requires ${minRole} access to the project.`);
  }
  return { userId, role: membership.role };
}
