import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { sites, siteItems } from "@/db/schema";
import { requireProjectAccess } from "@/lib/authz";
import { projectIdForSite } from "@/lib/resource-scope";
import { nextSortOrder } from "@/lib/reorder";
import { ApiError, withApiErrors } from "@/lib/api-response";
import { newId } from "@/utils/id";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: Params) {
  return withApiErrors(async () => {
    const { id: siteId } = await params;
    const projectId = await projectIdForSite(siteId);
    await requireProjectAccess(projectId, "editor");

    const [site] = await db.select().from(sites).where(eq(sites.id, siteId)).limit(1);
    if (!site) throw new ApiError(404, "NOT_FOUND", "Site not found.");

    const existing = await db.select({ sortOrder: siteItems.sortOrder }).from(siteItems).where(eq(siteItems.siteId, siteId));
    const id = newId("item");
    await db.insert(siteItems).values({ id, siteId, text: "", sortOrder: nextSortOrder(existing) });

    const [created] = await db.select().from(siteItems).where(eq(siteItems.id, id)).limit(1);
    return created;
  });
}
