import { desc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { auditLog, users } from "@/db/schema";
import { requirePermission } from "@/lib/permissions";
import { withApiErrors } from "@/lib/api-response";

const PAGE_SIZE = 25;

export async function GET(req: Request) {
  return withApiErrors(async () => {
    await requirePermission("settings", "view");

    const url = new URL(req.url);
    const page = Math.max(1, Number(url.searchParams.get("page") ?? "1") || 1);

    const rows = await db
      .select({
        id: auditLog.id,
        action: auditLog.action,
        details: auditLog.details,
        createdAt: auditLog.createdAt,
        userName: users.name,
      })
      .from(auditLog)
      .leftJoin(users, eq(auditLog.userId, users.id))
      .orderBy(desc(auditLog.createdAt))
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE);

    return { entries: rows, page, pageSize: PAGE_SIZE };
  });
}
