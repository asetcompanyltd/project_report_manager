import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { getCurrentUserId } from "@/lib/session";
import { withApiErrors } from "@/lib/api-response";

export async function GET() {
  return withApiErrors(async () => {
    const userId = await getCurrentUserId();
    if (!userId) return null;
    const [user] = await db
      .select({ id: users.id, email: users.email, name: users.name })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    return user ?? null;
  });
}
