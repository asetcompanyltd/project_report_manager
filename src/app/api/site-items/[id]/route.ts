import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { siteItems } from "@/db/schema";
import { requireProjectAccess } from "@/lib/authz";
import { projectIdForSiteItem } from "@/lib/resource-scope";
import { siteItemInputSchema } from "@/lib/validation/report";
import { ApiError, withApiErrors } from "@/lib/api-response";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  return withApiErrors(async () => {
    const { id } = await params;
    const projectId = await projectIdForSiteItem(id);
    await requireProjectAccess(projectId, "editor");
    const body = siteItemInputSchema.parse(await req.json());

    const [current] = await db.select().from(siteItems).where(eq(siteItems.id, id)).limit(1);
    if (!current) throw new ApiError(404, "NOT_FOUND", "Component not found.");

    await db.update(siteItems).set(body).where(eq(siteItems.id, id));
    const [updated] = await db.select().from(siteItems).where(eq(siteItems.id, id)).limit(1);
    return updated;
  });
}

export async function DELETE(_req: Request, { params }: Params) {
  return withApiErrors(async () => {
    const { id } = await params;
    const projectId = await projectIdForSiteItem(id);
    await requireProjectAccess(projectId, "editor");
    await db.delete(siteItems).where(eq(siteItems.id, id));
    return { success: true };
  });
}
