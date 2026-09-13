import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { phases } from "@/db/schema";
import { requireProjectAccess } from "@/lib/authz";
import { getReportByProjectId, logChange } from "@/lib/report-service";
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
      .select({ sortOrder: phases.sortOrder })
      .from(phases)
      .where(eq(phases.reportId, report.id));

    const id = newId("phase");
    await db.insert(phases).values({
      id,
      reportId: report.id,
      name: "New Phase",
      status: "Not Started",
      progress: 0,
      targetDate: "",
      remarks: "",
      sortOrder: nextSortOrder(existing),
    });
    await logChange(report.id, "Added new phase");

    const [created] = await db.select().from(phases).where(eq(phases.id, id)).limit(1);
    return created;
  });
}
