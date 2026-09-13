import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { appSettings } from "@/db/schema";
import { requireUserId } from "@/lib/authz";
import { withApiErrors } from "@/lib/api-response";

const DEFAULTS = { systemName: "Report Manager", companyName: "" };

// Every logged-in user needs the app's name/org in the sidebar, regardless of whether their
// role has access to the Settings module — this exposes just those two fields, not the rest
// of General Settings, so it doesn't need "settings:view".
export async function GET() {
  return withApiErrors(async () => {
    await requireUserId();

    const [row] = await db.select().from(appSettings).where(eq(appSettings.key, "general")).limit(1);
    const value = (row?.value as Record<string, unknown> | undefined) ?? {};

    return {
      systemName: (value.systemName as string) || DEFAULTS.systemName,
      companyName: (value.companyName as string) || DEFAULTS.companyName,
    };
  });
}
