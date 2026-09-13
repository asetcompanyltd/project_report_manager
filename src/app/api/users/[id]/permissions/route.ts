import { eq, and } from "drizzle-orm";
import { db } from "@/db/client";
import { users, userPermissionOverrides } from "@/db/schema";
import { requirePermission, getEffectivePermissions } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";
import { updatePermissionOverridesSchema } from "@/lib/validation/users";
import { ApiError, withApiErrors } from "@/lib/api-response";
import { newId } from "@/utils/id";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  return withApiErrors(async () => {
    await requirePermission("users", "view");
    const { id } = await params;

    const [user] = await db.select({ id: users.id }).from(users).where(eq(users.id, id)).limit(1);
    if (!user) throw new ApiError(404, "NOT_FOUND", "User not found.");

    const effective = await getEffectivePermissions(id);
    const overrides = await db.select().from(userPermissionOverrides).where(eq(userPermissionOverrides.userId, id));

    return { effective, overrides };
  });
}

export async function PATCH(req: Request, { params }: Params) {
  return withApiErrors(async () => {
    const actingUserId = await requirePermission("users", "edit");
    const { id } = await params;
    const body = updatePermissionOverridesSchema.parse(await req.json());

    const [user] = await db.select({ id: users.id, name: users.name }).from(users).where(eq(users.id, id)).limit(1);
    if (!user) throw new ApiError(404, "NOT_FOUND", "User not found.");

    await db.transaction(async (tx) => {
      for (const o of body.overrides) {
        const [existing] = await tx
          .select({ id: userPermissionOverrides.id })
          .from(userPermissionOverrides)
          .where(and(eq(userPermissionOverrides.userId, id), eq(userPermissionOverrides.module, o.module)))
          .limit(1);

        const values = {
          canView: o.view ?? null,
          canCreate: o.create ?? null,
          canEdit: o.edit ?? null,
          canDelete: o.delete ?? null,
        };

        if (existing) {
          await tx.update(userPermissionOverrides).set(values).where(eq(userPermissionOverrides.id, existing.id));
        } else {
          await tx.insert(userPermissionOverrides).values({ id: newId("upo"), userId: id, module: o.module, ...values });
        }
      }
    });

    await logAudit(actingUserId, "user.permissions_overridden", `Permission override changed for "${user.name}"`);

    const effective = await getEffectivePermissions(id);
    return { effective };
  });
}
