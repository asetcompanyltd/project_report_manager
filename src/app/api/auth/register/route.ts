import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { users, roles } from "@/db/schema";
import { hashPassword } from "@/lib/password";
import { setSessionCookie } from "@/lib/session";
import { DEFAULT_SELF_SIGNUP_ROLE_ID } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";
import { registerSchema } from "@/lib/validation/auth";
import { ApiError, withApiErrors } from "@/lib/api-response";
import { newId } from "@/utils/id";

export async function POST(req: Request) {
  return withApiErrors(async () => {
    const body = registerSchema.parse(await req.json());

    // Project Manager is the system administrator role — it's assigned/managed from the Users
    // page, never picked during self-registration, even if a client sends its id directly.
    if (body.roleId === DEFAULT_SELF_SIGNUP_ROLE_ID) {
      throw new ApiError(400, "INVALID_ROLE", "That role is not available for self-registration.");
    }

    const [role] = await db
      .select()
      .from(roles)
      .where(and(eq(roles.id, body.roleId), eq(roles.status, "Active")))
      .limit(1);
    if (!role) throw new ApiError(400, "INVALID_ROLE", "Selected role does not exist.");

    const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, body.email)).limit(1);
    if (existing) {
      throw new ApiError(409, "EMAIL_TAKEN", "An account with this email already exists.");
    }

    const id = newId("user");
    await db.insert(users).values({
      id,
      email: body.email,
      name: body.name,
      passwordHash: await hashPassword(body.password),
      roleId: body.roleId,
    });

    await logAudit(id, "user.registered", `Self-registered as "${role.name}"`);
    await setSessionCookie(id);
    return { id, email: body.email, name: body.name };
  });
}
