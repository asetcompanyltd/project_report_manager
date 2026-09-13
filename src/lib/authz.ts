import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { projectMembers, type ProjectRole } from "@/db/schema";
import { getCurrentUserId } from "./session";
import { getEffectivePermissions, type PermissionFlags } from "./permissions";
import { ApiError } from "./api-response";

const ROLE_RANK: Record<ProjectRole, number> = { viewer: 0, editor: 1, owner: 2 };

export async function requireUserId(): Promise<string> {
  const userId = await getCurrentUserId();
  if (!userId) throw new ApiError(401, "UNAUTHENTICATED", "You must be logged in.");
  return userId;
}

/**
 * Every account works across every project in the system (this is one team's shared workspace,
 * not a multi-tenant app) — an explicit project_members row is an override for a project someone
 * was specifically invited to, not a requirement to see a project at all. Everyone else's access
 * to a given project falls back to their global "projects" module permission.
 */
export function implicitProjectRole(projectPermissions: PermissionFlags): ProjectRole | null {
  if (projectPermissions.delete) return "owner";
  if (projectPermissions.edit) return "editor";
  if (projectPermissions.view) return "viewer";
  return null;
}

/**
 * The single choke point for project-scoped data access: every API route that touches
 * project-scoped data must resolve the project id and call this before reading/writing.
 * Returns 404 (not 403) for callers with no access at all, so a project's existence isn't leaked.
 */
export async function requireProjectAccess(projectId: string, minRole: ProjectRole = "viewer") {
  const userId = await requireUserId();
  const [membership] = await db
    .select()
    .from(projectMembers)
    .where(and(eq(projectMembers.projectId, projectId), eq(projectMembers.userId, userId)))
    .limit(1);

  let role: ProjectRole | null = membership?.role ?? null;
  if (!role) {
    const permissions = await getEffectivePermissions(userId);
    role = implicitProjectRole(permissions.projects);
  }

  if (!role) throw new ApiError(404, "NOT_FOUND", "Project not found.");
  if (ROLE_RANK[role] < ROLE_RANK[minRole]) {
    throw new ApiError(403, "FORBIDDEN", `This action requires ${minRole} access to the project.`);
  }
  return { userId, role };
}
