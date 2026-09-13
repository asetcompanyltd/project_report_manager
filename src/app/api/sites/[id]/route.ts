import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { sites } from "@/db/schema";
import { requireProjectAccess } from "@/lib/authz";
import { projectIdForSite } from "@/lib/resource-scope";
import { logChange, getReportByProjectId } from "@/lib/report-service";
import { siteInputSchema } from "@/lib/validation/report";
import { autoStatusFromProgress } from "@/utils/status";
import { ApiError, withApiErrors } from "@/lib/api-response";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  return withApiErrors(async () => {
    const { id } = await params;
    const projectId = await projectIdForSite(id);
    await requireProjectAccess(projectId, "editor");
    const report = await getReportByProjectId(projectId);

    const body = siteInputSchema.parse(await req.json());
    const [current] = await db.select().from(sites).where(eq(sites.id, id)).limit(1);
    if (!current) throw new ApiError(404, "NOT_FOUND", "Site not found.");

    const patch: Partial<typeof current> = { ...body };
    if (body.progress !== undefined) {
      patch.status = autoStatusFromProgress(body.progress);
    }
    await db.update(sites).set(patch).where(eq(sites.id, id));
    const name = body.name ?? current.name;

    if (body.progress !== undefined) {
      await logChange(report.id, `Site "${name}" progress set to ${body.progress}% (status: ${patch.status})`);
    } else if (body.status !== undefined) {
      await logChange(report.id, `Site "${name}" status manually set to ${body.status}`);
    }

    const [updated] = await db.select().from(sites).where(eq(sites.id, id)).limit(1);
    return updated;
  });
}

export async function DELETE(_req: Request, { params }: Params) {
  return withApiErrors(async () => {
    const { id } = await params;
    const projectId = await projectIdForSite(id);
    await requireProjectAccess(projectId, "editor");
    const report = await getReportByProjectId(projectId);

    const [current] = await db.select().from(sites).where(eq(sites.id, id)).limit(1);
    if (!current) throw new ApiError(404, "NOT_FOUND", "Site not found.");

    await db.delete(sites).where(eq(sites.id, id));
    await logChange(report.id, `Removed site "${current.name}"`);

    return { success: true };
  });
}
