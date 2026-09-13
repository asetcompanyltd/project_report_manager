import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { nextSteps } from "@/db/schema";
import { requireProjectAccess } from "@/lib/authz";
import { getReportByProjectId } from "@/lib/report-service";
import { nextSortOrder } from "@/lib/reorder";
import { withApiErrors } from "@/lib/api-response";
import { newId } from "@/utils/id";

type Params = { params: Promise<{ projectId: string }> };

export async function POST(_req: Request, { params }: Params) {
  return withApiErrors(async () => {
    const { projectId } = await params;
    await requireProjectAccess(projectId, "editor");
    const report = await getReportByProjectId(projectId);

    const existing = await db
      .select({ sortOrder: nextSteps.sortOrder })
      .from(nextSteps)
      .where(eq(nextSteps.reportId, report.id));

    const id = newId("step");
    await db.insert(nextSteps).values({ id, reportId: report.id, text: "", sortOrder: nextSortOrder(existing) });

    const [created] = await db.select().from(nextSteps).where(eq(nextSteps.id, id)).limit(1);
    return created;
  });
}
