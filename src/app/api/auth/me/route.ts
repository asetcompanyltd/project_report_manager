import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { users, roles } from "@/db/schema";
import { getCurrentUserId } from "@/lib/session";
import { getEffectivePermissions } from "@/lib/permissions";
import { withApiErrors } from "@/lib/api-response";

export async function GET() {
  return withApiErrors(async () => {
    const userId = await getCurrentUserId();
    if (!userId) return null;

    const [row] = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        username: users.username,
        roleId: users.roleId,
        roleName: roles.name,
        status: users.status,
        profileImage: users.profileImage,
        themePreference: users.themePreference,
      })
      .from(users)
      .leftJoin(roles, eq(users.roleId, roles.id))
      .where(eq(users.id, userId))
      .limit(1);

    if (!row) return null;

    const permissions = await getEffectivePermissions(userId);
    return { ...row, permissions };
  });
}
