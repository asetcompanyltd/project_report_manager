import { asc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { snapshots } from "@/db/schema";
import { requireProjectAccess } from "@/lib/authz";
import { buildSnapshotPayload, getReportByProjectId, logChange } from "@/lib/report-service";
import { snapshotInputSchema } from "@/lib/validation/report";
import { withApiErrors } from "@/lib/api-response";
import { newId } from "@/utils/id";

type Params = { params: Promise<{ projectId: string }> };

export async function GET(_req: Request, { params }: Params) {
  return withApiErrors(async () => {
    const { projectId } = await params;
    await requireProjectAccess(projectId, "viewer");
    const report = await getReportByProjectId(projectId);
    return db
      .select({ id: snapshots.id, label: snapshots.label, createdAt: snapshots.createdAt })
      .from(snapshots)
      .where(eq(snapshots.reportId, report.id))
      .orderBy(asc(snapshots.createdAt));
  });
}

export async function POST(req: Request, { params }: Params) {
  return withApiErrors(async () => {
    const { projectId } = await params;
    await requireProjectAccess(projectId, "editor");
    const body = snapshotInputSchema.parse(await req.json());
    const report = await getReportByProjectId(projectId);

    const payload = await buildSnapshotPayload(projectId);
    const id = newId("snap");
    await db.insert(snapshots).values({ id, reportId: report.id, label: body.label, data: payload });
    await logChange(report.id, `Saved version "${body.label}"`);

    const [created] = await db
      .select({ id: snapshots.id, label: snapshots.label, createdAt: snapshots.createdAt })
      .from(snapshots)
      .where(eq(snapshots.id, id))
      .limit(1);
    return created;
  });
}
