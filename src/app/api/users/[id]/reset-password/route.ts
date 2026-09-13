import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { requirePermission } from "@/lib/permissions";
import { hashPassword } from "@/lib/password";
import { logAudit } from "@/lib/audit";
import { resetPasswordSchema } from "@/lib/validation/users";
import { ApiError, withApiErrors } from "@/lib/api-response";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Params) {
  return withApiErrors(async () => {
    const actingUserId = await requirePermission("users", "edit");
    const { id } = await params;
    const body = resetPasswordSchema.parse(await req.json());

    const [user] = await db.select({ id: users.id, name: users.name }).from(users).where(eq(users.id, id)).limit(1);
    if (!user) throw new ApiError(404, "NOT_FOUND", "User not found.");

    await db.update(users).set({ passwordHash: await hashPassword(body.password) }).where(eq(users.id, id));
    await logAudit(actingUserId, "user.password_reset", `Password reset for "${user.name}"`);

    return { success: true };
  });
}
