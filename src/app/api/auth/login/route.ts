import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { verifyPassword } from "@/lib/password";
import { setSessionCookie } from "@/lib/session";
import { loginSchema } from "@/lib/validation/auth";
import { ApiError, withApiErrors } from "@/lib/api-response";

export async function POST(req: Request) {
  return withApiErrors(async () => {
    const body = loginSchema.parse(await req.json());

    const [user] = await db.select().from(users).where(eq(users.email, body.email)).limit(1);
    const passwordOk = user ? await verifyPassword(body.password, user.passwordHash) : false;
    if (!user || !passwordOk) {
      throw new ApiError(401, "INVALID_CREDENTIALS", "Incorrect email or password.");
    }
    if (user.status === "Inactive") {
      throw new ApiError(403, "ACCOUNT_INACTIVE", "This account has been deactivated. Contact your administrator.");
    }

    await db.update(users).set({ lastLoginAt: new Date().toISOString() }).where(eq(users.id, user.id));
    await setSessionCookie(user.id, body.remember);
    return { id: user.id, email: user.email, name: user.name };
  });
}
