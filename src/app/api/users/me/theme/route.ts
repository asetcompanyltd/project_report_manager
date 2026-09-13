import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { requireUserId } from "@/lib/authz";
import { themePreferenceSchema } from "@/lib/validation/users";
import { withApiErrors } from "@/lib/api-response";

export async function PATCH(req: Request) {
  return withApiErrors(async () => {
    const userId = await requireUserId();
    const body = themePreferenceSchema.parse(await req.json());
    await db.update(users).set({ themePreference: body.theme }).where(eq(users.id, userId));
    return { theme: body.theme };
  });
}
