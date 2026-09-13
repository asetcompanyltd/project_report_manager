import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { appSettings } from "@/db/schema";
import { requirePermission } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";
import { settingsKeySchema, SETTINGS_SCHEMAS } from "@/lib/validation/settings";
import { withApiErrors } from "@/lib/api-response";
import { z } from "zod";

const SETTINGS_KEYS = ["general", "notifications", "security", "system"] as const;

const DEFAULTS: Record<(typeof SETTINGS_KEYS)[number], Record<string, unknown>> = {
  general: {
    systemName: "Report Manager",
    companyName: "",
    companyInfo: "",
    contactEmail: "",
    contactPhone: "",
    dateFormat: "DD-MMM-YYYY",
    timeFormat: "24h",
    language: "en",
  },
  notifications: {
    systemNotifications: true,
    emailNotifications: false,
    alertOnOverdue: true,
  },
  security: {
    minPasswordLength: 8,
    sessionTimeoutMinutes: 10080,
    requireStrongPassword: false,
  },
  system: {
    auditLogEnabled: true,
    dataRetentionDays: 365,
  },
};

const patchSchema = z.object({
  key: settingsKeySchema,
  values: z.record(z.string(), z.unknown()),
});

export async function GET() {
  return withApiErrors(async () => {
    // Settings are viewable by anyone with "settings" view access; every logged-in user can still
    // read general/appearance-adjacent info they need, but the route itself is gated like any module.
    await requirePermission("settings", "view");

    const rows = await db.select().from(appSettings);
    const byKey = new Map(rows.map((r) => [r.key, r.value as Record<string, unknown>]));

    return Object.fromEntries(SETTINGS_KEYS.map((k) => [k, { ...DEFAULTS[k], ...(byKey.get(k) ?? {}) }]));
  });
}

export async function PATCH(req: Request) {
  return withApiErrors(async () => {
    const actingUserId = await requirePermission("settings", "edit");
    const body = patchSchema.parse(await req.json());

    const schema = SETTINGS_SCHEMAS[body.key];
    const parsedValues = schema.parse(body.values);

    const [existing] = await db.select().from(appSettings).where(eq(appSettings.key, body.key)).limit(1);
    const merged = { ...DEFAULTS[body.key], ...(existing?.value as Record<string, unknown> | undefined), ...parsedValues };

    if (existing) {
      await db.update(appSettings).set({ value: merged, updatedAt: new Date().toISOString() }).where(eq(appSettings.key, body.key));
    } else {
      await db.insert(appSettings).values({ key: body.key, value: merged });
    }

    await logAudit(actingUserId, "settings.changed", `Updated "${body.key}" settings`);

    return { key: body.key, values: merged };
  });
}
