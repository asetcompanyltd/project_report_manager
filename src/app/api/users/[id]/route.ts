import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { users, roles } from "@/db/schema";
import { requirePermission } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";
import { updateUserSchema } from "@/lib/validation/users";
import { ApiError, withApiErrors } from "@/lib/api-response";

type Params = { params: Promise<{ id: string }> };

async function loadUserWithRole(id: string) {
  const [row] = await db
    .select({ user: users, roleName: roles.name })
    .from(users)
    .leftJoin(roles, eq(users.roleId, roles.id))
    .where(eq(users.id, id))
    .limit(1);
  return row ?? null;
}

function toSafeUser(row: NonNullable<Awaited<ReturnType<typeof loadUserWithRole>>>) {
  return {
    id: row.user.id,
    name: row.user.name,
    username: row.user.username,
    email: row.user.email,
    phone: row.user.phone,
    roleId: row.user.roleId,
    roleName: row.roleName,
    status: row.user.status,
    profileImage: row.user.profileImage,
    themePreference: row.user.themePreference,
    lastLoginAt: row.user.lastLoginAt,
    createdAt: row.user.createdAt,
  };
}

export async function GET(_req: Request, { params }: Params) {
  return withApiErrors(async () => {
    await requirePermission("users", "view");
    const { id } = await params;
    const row = await loadUserWithRole(id);
    if (!row) throw new ApiError(404, "NOT_FOUND", "User not found.");
    return toSafeUser(row);
  });
}

export async function PATCH(req: Request, { params }: Params) {
  return withApiErrors(async () => {
    const { id } = await params;
    const current = await loadUserWithRole(id);
    if (!current) throw new ApiError(404, "NOT_FOUND", "User not found.");

    const body = updateUserSchema.parse(await req.json());
    // Activating/deactivating or changing role is an "edit"; per spec, "delete" on Users means deactivate,
    // so either edit or delete permission is sufficient to flip status off.
    const isDeactivating = body.status === "Inactive" && current.user.status !== "Inactive";
    const actingUserId = isDeactivating
      ? await requirePermission("users", "delete").catch(() => requirePermission("users", "edit"))
      : await requirePermission("users", "edit");

    if (body.username !== undefined && body.username !== current.user.username) {
      if (body.username) {
        const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.username, body.username)).limit(1);
        if (existing && existing.id !== id) throw new ApiError(409, "USERNAME_TAKEN", "This username is already in use.");
      }
    }

    let newRoleName: string | null = current.roleName;
    if (body.roleId && body.roleId !== current.user.roleId) {
      const [role] = await db.select().from(roles).where(eq(roles.id, body.roleId)).limit(1);
      if (!role) throw new ApiError(400, "INVALID_ROLE", "Selected role does not exist.");
      newRoleName = role.name;
    }

    await db
      .update(users)
      .set({
        ...(body.name !== undefined ? { name: body.name } : {}),
        ...(body.username !== undefined ? { username: body.username } : {}),
        ...(body.phone !== undefined ? { phone: body.phone } : {}),
        ...(body.roleId !== undefined ? { roleId: body.roleId } : {}),
        ...(body.status !== undefined ? { status: body.status } : {}),
        ...(body.profileImage !== undefined ? { profileImage: body.profileImage } : {}),
      })
      .where(eq(users.id, id));

    if (body.status && body.status !== current.user.status) {
      await logAudit(actingUserId, body.status === "Active" ? "user.activated" : "user.deactivated", `User "${current.user.name}"`);
    }
    if (body.roleId && body.roleId !== current.user.roleId) {
      await logAudit(actingUserId, "user.role_changed", `User "${current.user.name}" role changed to "${newRoleName}"`);
    }
    if (body.name || body.username !== undefined || body.phone !== undefined) {
      await logAudit(actingUserId, "user.edited", `User "${current.user.name}" profile updated`);
    }

    const updated = await loadUserWithRole(id);
    return toSafeUser(updated!);
  });
}
