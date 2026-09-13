import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { users, roles } from "@/db/schema";
import { requirePermission } from "@/lib/permissions";
import { hashPassword } from "@/lib/password";
import { logAudit } from "@/lib/audit";
import { createUserSchema } from "@/lib/validation/users";
import { ApiError, withApiErrors } from "@/lib/api-response";
import { newId } from "@/utils/id";

function toSafeUser(row: typeof users.$inferSelect, roleName: string | null) {
  return {
    id: row.id,
    name: row.name,
    username: row.username,
    email: row.email,
    phone: row.phone,
    roleId: row.roleId,
    roleName,
    status: row.status,
    profileImage: row.profileImage,
    themePreference: row.themePreference,
    lastLoginAt: row.lastLoginAt,
    createdAt: row.createdAt,
  };
}

export async function GET() {
  return withApiErrors(async () => {
    await requirePermission("users", "view");

    const rows = await db
      .select({ user: users, roleName: roles.name })
      .from(users)
      .leftJoin(roles, eq(users.roleId, roles.id));

    return rows.map((r) => toSafeUser(r.user, r.roleName));
  });
}

export async function POST(req: Request) {
  return withApiErrors(async () => {
    const actingUserId = await requirePermission("users", "create");
    const body = createUserSchema.parse(await req.json());

    const [existingEmail] = await db.select({ id: users.id }).from(users).where(eq(users.email, body.email)).limit(1);
    if (existingEmail) throw new ApiError(409, "EMAIL_TAKEN", "An account with this email already exists.");

    if (body.username) {
      const [existingUsername] = await db.select({ id: users.id }).from(users).where(eq(users.username, body.username)).limit(1);
      if (existingUsername) throw new ApiError(409, "USERNAME_TAKEN", "This username is already in use.");
    }

    const [role] = await db.select().from(roles).where(eq(roles.id, body.roleId)).limit(1);
    if (!role) throw new ApiError(400, "INVALID_ROLE", "Selected role does not exist.");

    const id = newId("user");
    await db.insert(users).values({
      id,
      name: body.name,
      username: body.username ?? null,
      email: body.email,
      phone: body.phone ?? null,
      passwordHash: await hashPassword(body.password),
      roleId: body.roleId,
      status: body.status ?? "Active",
      profileImage: body.profileImage ?? null,
    });

    await logAudit(actingUserId, "user.created", `Created user "${body.name}" (${body.email}) with role "${role.name}"`);

    const [created] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return toSafeUser(created, role.name);
  });
}
