import { db } from "@/db/client";
import { snapshots } from "@/db/schema";
import { requireProjectAccess } from "@/lib/authz";
import { getReportByProjectId, replaceReportContent, logChange, getFullReport } from "@/lib/report-service";
import { importReportSchema } from "@/lib/validation/report";
import { withApiErrors } from "@/lib/api-response";
import { newId } from "@/utils/id";

type Params = { params: Promise<{ projectId: string }> };

export async function POST(req: Request, { params }: Params) {
  return withApiErrors(async () => {
    const { projectId } = await params;
    await requireProjectAccess(projectId, "editor");
    const body = importReportSchema.parse(await req.json());
    const report = await getReportByProjectId(projectId);

    await replaceReportContent(projectId, body.data);

    for (const snap of body.snapshots) {
      const label = typeof snap.label === "string" ? snap.label : "Imported version";
      await db.insert(snapshots).values({
        id: newId("snap"),
        reportId: report.id,
        label,
        data: snap.data ?? {},
      });
    }

    await logChange(report.id, "Imported data from backup file");

    return getFullReport(projectId);
  });
}
