import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { reports } from "@/db/schema";
import { requireProjectAccess } from "@/lib/authz";
import { getFullReport, getReportByProjectId } from "@/lib/report-service";
import { reportMetaSchema } from "@/lib/validation/report";
import { withApiErrors } from "@/lib/api-response";

type Params = { params: Promise<{ projectId: string }> };

export async function GET(_req: Request, { params }: Params) {
  return withApiErrors(async () => {
    const { projectId } = await params;
    await requireProjectAccess(projectId, "viewer");
    return getFullReport(projectId);
  });
}

export async function PATCH(req: Request, { params }: Params) {
  return withApiErrors(async () => {
    const { projectId } = await params;
    await requireProjectAccess(projectId, "editor");
    const body = reportMetaSchema.parse(await req.json());
    const report = await getReportByProjectId(projectId);

    await db
      .update(reports)
      .set({ ...body, updatedAt: new Date().toISOString() })
      .where(eq(reports.id, report.id));

    return getFullReport(projectId);
  });
}
