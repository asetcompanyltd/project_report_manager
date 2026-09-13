import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { phaseDetails, sites, siteItems } from "@/db/schema";
import { requireProjectAccess } from "@/lib/authz";
import { projectIdForPhaseDetail } from "@/lib/resource-scope";
import { nextSortOrder } from "@/lib/reorder";
import { ApiError, withApiErrors } from "@/lib/api-response";
import { newId } from "@/utils/id";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: Params) {
  return withApiErrors(async () => {
    const { id: phaseDetailId } = await params;
    const projectId = await projectIdForPhaseDetail(phaseDetailId);
    await requireProjectAccess(projectId, "editor");

    const [pd] = await db.select().from(phaseDetails).where(eq(phaseDetails.id, phaseDetailId)).limit(1);
    if (!pd) throw new ApiError(404, "NOT_FOUND", "Phase detail section not found.");

    const existing = await db.select({ sortOrder: sites.sortOrder }).from(sites).where(eq(sites.phaseDetailId, phaseDetailId));

    const siteId = newId("site");
    await db.transaction(async (tx) => {
      await tx.insert(sites).values({
        id: siteId,
        phaseDetailId,
        name: "",
        status: "Not Started",
        progress: 0,
        targetDate: "",
        sortOrder: nextSortOrder(existing),
      });
      await tx.insert(siteItems).values({ id: newId("item"), siteId, text: "", sortOrder: 0 });
    });

    const [created] = await db.select().from(sites).where(eq(sites.id, siteId)).limit(1);
    return created;
  });
}
