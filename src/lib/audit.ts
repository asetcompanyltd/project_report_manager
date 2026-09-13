import { db } from "@/db/client";
import { auditLog } from "@/db/schema";
import { newId } from "@/utils/id";

export async function logAudit(userId: string | null, action: string, details: string = "") {
  await db.insert(auditLog).values({ id: newId("audit"), userId, action, details });
}
