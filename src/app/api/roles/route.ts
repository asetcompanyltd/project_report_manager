import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { roles, rolePermissions, permissionModuleValues } from "@/db/schema";
import { requirePermission } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";
import { createRoleSchema } from "@/lib/validation/roles";
import { ApiError, withApiErrors } from "@/lib/api-response";
import { newId } from "@/utils/id";

export async function GET() {
  return withApiErrors(async () => {
    await requirePermission("roles", "view");
    return db.select().from(roles).orderBy(roles.name);
  });
}

export async function POST(req: Request) {
  return withApiErrors(async () => {
    const actingUserId = await requirePermission("roles", "create");
    const body = createRoleSchema.parse(await req.json());

    const [existing] = await db.select({ id: roles.id }).from(roles).where(eq(roles.name, body.name)).limit(1);
    if (existing) throw new ApiError(409, "NAME_TAKEN", `A role named "${body.name}" already exists.`);

    const id = newId("role");
    await db.transaction(async (tx) => {
      await tx.insert(roles).values({
        id,
        name: body.name,
        description: body.description ?? "",
        status: body.status ?? "Active",
        isSystem: false,
      });
      // New custom roles start with no access anywhere until explicitly configured.
      for (const moduleName of permissionModuleValues) {
        await tx.insert(rolePermissions).values({
          id: newId("rp"),
          roleId: id,
          module: moduleName,
          canView: false,
          canCreate: false,
          canEdit: false,
          canDelete: false,
        });
      }
    });

    await logAudit(actingUserId, "role.created", `Created role "${body.name}"`);

    const [created] = await db.select().from(roles).where(eq(roles.id, id)).limit(1);
    return created;
  });
}
