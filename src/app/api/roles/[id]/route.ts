import { eq, ne, and, count } from "drizzle-orm";
import { db } from "@/db/client";
import { roles, users } from "@/db/schema";
import { requirePermission } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";
import { updateRoleSchema } from "@/lib/validation/roles";
import { ApiError, withApiErrors } from "@/lib/api-response";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  return withApiErrors(async () => {
    await requirePermission("roles", "view");
    const { id } = await params;
    const [role] = await db.select().from(roles).where(eq(roles.id, id)).limit(1);
    if (!role) throw new ApiError(404, "NOT_FOUND", "Role not found.");
    return role;
  });
}

export async function PATCH(req: Request, { params }: Params) {
  return withApiErrors(async () => {
    const actingUserId = await requirePermission("roles", "edit");
    const { id } = await params;
    const body = updateRoleSchema.parse(await req.json());

    const [current] = await db.select().from(roles).where(eq(roles.id, id)).limit(1);
    if (!current) throw new ApiError(404, "NOT_FOUND", "Role not found.");

    if (body.name && body.name !== current.name) {
      const [existing] = await db.select({ id: roles.id }).from(roles).where(eq(roles.name, body.name)).limit(1);
      if (existing) throw new ApiError(409, "NAME_TAKEN", `A role named "${body.name}" already exists.`);
    }

    await db
      .update(roles)
      .set({ ...body, updatedAt: new Date().toISOString() })
      .where(eq(roles.id, id));

    await logAudit(actingUserId, "role.edited", `Role "${current.name}" updated`);

    const [updated] = await db.select().from(roles).where(eq(roles.id, id)).limit(1);
    return updated;
  });
}

export async function DELETE(req: Request, { params }: Params) {
  return withApiErrors(async () => {
    const actingUserId = await requirePermission("roles", "delete");
    const { id } = await params;

    const [role] = await db.select().from(roles).where(eq(roles.id, id)).limit(1);
    if (!role) throw new ApiError(404, "NOT_FOUND", "Role not found.");
    if (role.isSystem) {
      throw new ApiError(400, "SYSTEM_ROLE", `"${role.name}" is a predefined role and cannot be deleted — deactivate it instead.`);
    }

    const url = new URL(req.url);
    const reassignToRoleId = url.searchParams.get("reassignToRoleId");

    const [{ value: assignedCount }] = await db
      .select({ value: count() })
      .from(users)
      .where(eq(users.roleId, id));

    if (assignedCount > 0) {
      if (!reassignToRoleId) {
        throw new ApiError(
          409,
          "ROLE_IN_USE",
          `${assignedCount} user(s) are assigned to "${role.name}". Provide reassignToRoleId to move them to another role and retry.`
        );
      }
      const [targetRole] = await db
        .select()
        .from(roles)
        .where(and(eq(roles.id, reassignToRoleId), ne(roles.id, id)))
        .limit(1);
      if (!targetRole) throw new ApiError(400, "INVALID_ROLE", "reassignToRoleId is not a valid, different role.");

      await db.transaction(async (tx) => {
        await tx.update(users).set({ roleId: reassignToRoleId }).where(eq(users.roleId, id));
        await tx.delete(roles).where(eq(roles.id, id));
      });
      await logAudit(
        actingUserId,
        "role.deleted",
        `Deleted role "${role.name}"; reassigned ${assignedCount} user(s) to "${targetRole.name}"`
      );
      return { success: true, reassigned: assignedCount };
    }

    await db.delete(roles).where(eq(roles.id, id));
    await logAudit(actingUserId, "role.deleted", `Deleted role "${role.name}"`);
    return { success: true, reassigned: 0 };
  });
}
