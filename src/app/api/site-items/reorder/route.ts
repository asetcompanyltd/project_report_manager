import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { siteItems } from "@/db/schema";
import { requireProjectAccess } from "@/lib/authz";
import { projectIdForSiteItem } from "@/lib/resource-scope";
import { computeReorderSwap } from "@/lib/reorder";
import { reorderSchema } from "@/lib/validation/report";
import { withApiErrors } from "@/lib/api-response";

export async function POST(req: Request) {
  return withApiErrors(async () => {
    const body = reorderSchema.parse(await req.json());
    const projectId = await projectIdForSiteItem(body.id);
    await requireProjectAccess(projectId, "editor");

    const [current] = await db.select().from(siteItems).where(eq(siteItems.id, body.id)).limit(1);
    if (!current) return { success: true };

    const siblings = await db.select().from(siteItems).where(eq(siteItems.siteId, current.siteId));
    const swap = computeReorderSwap(siblings, body.id, body.direction);
    if (!swap) return { success: true };

    const [a, b] = swap;
    await db.transaction(async (tx) => {
      await tx.update(siteItems).set({ sortOrder: b.sortOrder }).where(eq(siteItems.id, a.id));
      await tx.update(siteItems).set({ sortOrder: a.sortOrder }).where(eq(siteItems.id, b.id));
    });

    return { success: true };
  });
}
