import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { hashPassword } from "@/lib/password";
import { setSessionCookie } from "@/lib/session";
import { registerSchema } from "@/lib/validation/auth";
import { ApiError, withApiErrors } from "@/lib/api-response";
import { newId } from "@/utils/id";

export async function POST(req: Request) {
  return withApiErrors(async () => {
    const body = registerSchema.parse(await req.json());

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
    });

    await setSessionCookie(id);
    return { id, email: body.email, name: body.name };
  });
}
