import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { roles, rolePermissions, userPermissionOverrides, users, permissionModuleValues, type PermissionModule } from "@/db/schema";

export type { PermissionModule };
import { requireUserId } from "./authz";
import { ApiError } from "./api-response";

export const PERMISSION_ACTIONS = ["view", "create", "edit", "delete"] as const;
export type PermissionAction = (typeof PERMISSION_ACTIONS)[number];

export type PermissionFlags = Record<PermissionAction, boolean>;
export type PermissionMatrix = Record<PermissionModule, PermissionFlags>;

const EMPTY_FLAGS: PermissionFlags = { view: false, create: false, edit: false, delete: false };

function emptyMatrix(): PermissionMatrix {
  return Object.fromEntries(permissionModuleValues.map((m) => [m, { ...EMPTY_FLAGS }])) as PermissionMatrix;
}

/** Resolves a user's effective permissions: role defaults, with any non-null per-user override applied. */
export async function getEffectivePermissions(userId: string): Promise<PermissionMatrix> {
  const matrix = emptyMatrix();

  const [user] = await db.select({ roleId: users.roleId }).from(users).where(eq(users.id, userId)).limit(1);
  if (!user) return matrix;

  if (user.roleId) {
    const rows = await db.select().from(rolePermissions).where(eq(rolePermissions.roleId, user.roleId));
    for (const row of rows) {
      if (row.module in matrix) {
        matrix[row.module as PermissionModule] = {
          view: row.canView,
          create: row.canCreate,
          edit: row.canEdit,
          delete: row.canDelete,
        };
      }
    }
  }

  const overrides = await db.select().from(userPermissionOverrides).where(eq(userPermissionOverrides.userId, userId));
  for (const row of overrides) {
    if (!(row.module in matrix)) continue;
    const current = matrix[row.module as PermissionModule];
    matrix[row.module as PermissionModule] = {
      view: row.canView ?? current.view,
      create: row.canCreate ?? current.create,
      edit: row.canEdit ?? current.edit,
      delete: row.canDelete ?? current.delete,
    };
  }

  return matrix;
}

export async function can(userId: string, module: PermissionModule, action: PermissionAction): Promise<boolean> {
  const matrix = await getEffectivePermissions(userId);
  return matrix[module][action];
}

/** Throws 403 if the current session user lacks `action` on `module`. Returns the userId on success. */
export async function requirePermission(module: PermissionModule, action: PermissionAction): Promise<string> {
  const userId = await requireUserId();
  const allowed = await can(userId, module, action);
  if (!allowed) {
    throw new ApiError(403, "FORBIDDEN", `You do not have ${action} access to ${module}.`);
  }
  return userId;
}

export async function getRoleById(roleId: string) {
  const [role] = await db.select().from(roles).where(eq(roles.id, roleId)).limit(1);
  return role ?? null;
}

export const DEFAULT_SELF_SIGNUP_ROLE_ID = "role_project_manager";
