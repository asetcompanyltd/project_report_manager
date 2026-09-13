import { eq, and } from "drizzle-orm";
import { db } from "@/db/client";
import { roles, rolePermissions } from "@/db/schema";
import { requirePermission } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";
import { updateRolePermissionsSchema } from "@/lib/validation/roles";
import { ApiError, withApiErrors } from "@/lib/api-response";
import { newId } from "@/utils/id";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  return withApiErrors(async () => {
    await requirePermission("roles", "view");
    const { id } = await params;
    const [role] = await db.select().from(roles).where(eq(roles.id, id)).limit(1);
    if (!role) throw new ApiError(404, "NOT_FOUND", "Role not found.");
    return db.select().from(rolePermissions).where(eq(rolePermissions.roleId, id));
  });
}

export async function PATCH(req: Request, { params }: Params) {
  return withApiErrors(async () => {
    const actingUserId = await requirePermission("roles", "edit");
    const { id } = await params;
    const body = updateRolePermissionsSchema.parse(await req.json());

    const [role] = await db.select().from(roles).where(eq(roles.id, id)).limit(1);
    if (!role) throw new ApiError(404, "NOT_FOUND", "Role not found.");

    await db.transaction(async (tx) => {
      for (const p of body.permissions) {
        const [existing] = await tx
          .select({ id: rolePermissions.id })
          .from(rolePermissions)
          .where(and(eq(rolePermissions.roleId, id), eq(rolePermissions.module, p.module)))
          .limit(1);

        const values = { canView: p.view, canCreate: p.create, canEdit: p.edit, canDelete: p.delete };
        if (existing) {
          await tx.update(rolePermissions).set(values).where(eq(rolePermissions.id, existing.id));
        } else {
          await tx.insert(rolePermissions).values({ id: newId("rp"), roleId: id, module: p.module, ...values });
        }
      }
    });

    await logAudit(actingUserId, "role.permissions_changed", `Permissions updated for role "${role.name}"`);

    return db.select().from(rolePermissions).where(eq(rolePermissions.roleId, id));
  });
}
