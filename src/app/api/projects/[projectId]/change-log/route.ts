import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { changeLog } from "@/db/schema";
import { requireProjectAccess } from "@/lib/authz";
import { getReportByProjectId } from "@/lib/report-service";
import { withApiErrors } from "@/lib/api-response";

type Params = { params: Promise<{ projectId: string }> };

export async function DELETE(_req: Request, { params }: Params) {
  return withApiErrors(async () => {
    const { projectId } = await params;
    await requireProjectAccess(projectId, "editor");
    const report = await getReportByProjectId(projectId);
    await db.delete(changeLog).where(eq(changeLog.reportId, report.id));
    return { success: true };
  });
}
