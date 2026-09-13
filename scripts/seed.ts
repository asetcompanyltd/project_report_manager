import { eq } from "drizzle-orm";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import bcrypt from "bcryptjs";
import * as schema from "../src/db/schema";
import { loadEnvLocal } from "./env";

loadEnvLocal();

const DEMO_EMAIL = "demo@example.com";
const DEMO_PASSWORD = "Demo1234!";
const DEMO_PROJECT_CODE = "DEMO";

/**
 * Opt-in only (`npm run db:seed`) — never runs automatically. Creates one clearly-labeled
 * "Demo Project" using the sample WTP content from the legacy tool, so the app isn't
 * shipped with real-looking data baked in (see plan's "Demo/sample data" section).
 */
async function main() {
  const url = process.env.DATABASE_URL ?? "file:./local.db";
  const client = createClient({ url, authToken: process.env.DATABASE_AUTH_TOKEN });
  await client.execute("PRAGMA foreign_keys = ON");
  const db = drizzle(client, { schema });

  const [existingProject] = await db
    .select()
    .from(schema.projects)
    .where(eq(schema.projects.code, DEMO_PROJECT_CODE))
    .limit(1);
  if (existingProject) {
    console.log(`Demo project (code "${DEMO_PROJECT_CODE}") already exists — nothing to do.`);
    client.close();
    return;
  }

  let [user] = await db.select().from(schema.users).where(eq(schema.users.email, DEMO_EMAIL)).limit(1);
  if (!user) {
    const id = `user_${crypto.randomUUID()}`;
    await db.insert(schema.users).values({
      id,
      email: DEMO_EMAIL,
      name: "Demo User",
      passwordHash: await bcrypt.hash(DEMO_PASSWORD, 12),
    });
    [user] = await db.select().from(schema.users).where(eq(schema.users.id, id)).limit(1);
    console.log(`Created demo user: ${DEMO_EMAIL} / ${DEMO_PASSWORD} (change or remove this before production use)`);
  }

  const projectId = `proj_${crypto.randomUUID()}`;
  const reportId = `report_${crypto.randomUUID()}`;
  const now = new Date().toISOString();

  await db.transaction(async (tx) => {
    await tx.insert(schema.projects).values({
      id: projectId,
      code: DEMO_PROJECT_CODE,
      name: "Demo Project",
      description: "Sample data for exploring the app — not a real project.",
      status: "Active",
      createdBy: user.id,
      createdAt: now,
      updatedAt: now,
    });
    await tx.insert(schema.projectMembers).values({
      id: `member_${crypto.randomUUID()}`,
      projectId,
      userId: user.id,
      role: "owner",
    });
    await tx.insert(schema.reports).values({
      id: reportId,
      projectId,
      title: "UPPER RUVU WATER TREATMENT PLANT (WTP)",
      subtitle: "Instrumentation & Control System Project",
      reportDate: "2026-07-29",
      preparedBy: "",
      notes:
        "Progress percentages and target dates in this report are current estimates for stakeholder planning purposes and should be updated as work proceeds and confirmed schedules become available.",
      updatedAt: now,
    });

    const installPhaseId = `phase_${crypto.randomUUID()}`;
    const phaseRows = [
      { id: installPhaseId, name: "Installation Phase", status: "In Progress" as const, progress: 75, targetDate: "2026-08-15", remarks: "Intake WTP complete; High Lift WTP ongoing" },
      { id: `phase_${crypto.randomUUID()}`, name: "Configuration Phase", status: "Not Started" as const, progress: 0, targetDate: "2026-08-29", remarks: "Begins after installation sign-off" },
      { id: `phase_${crypto.randomUUID()}`, name: "Testing Phase", status: "Not Started" as const, progress: 0, targetDate: "2026-09-12", remarks: "Includes functional & integration testing" },
      { id: `phase_${crypto.randomUUID()}`, name: "Training and Commissioning", status: "Not Started" as const, progress: 0, targetDate: "2026-09-26", remarks: "Final phase prior to handover" },
    ];
    for (let i = 0; i < phaseRows.length; i++) {
      await tx.insert(schema.phases).values({ ...phaseRows[i], reportId, sortOrder: i });
    }

    const phaseDetailId = `pd_${crypto.randomUUID()}`;
    await tx.insert(schema.phaseDetails).values({ id: phaseDetailId, reportId, phaseId: installPhaseId, sortOrder: 0 });

    const siteDefs = [
      {
        name: "Intake Raw Water WTP",
        status: "Complete" as const,
        progress: 100,
        targetDate: "Completed",
        items: ["Level Sensor & Transmitter", "Flowmeter Converter & Transmitter", "Pressure Transmitters (3 units) & Hub", "Local Gateway & HMI Panel Box"],
      },
      {
        name: "High Lift Clear Water WTP",
        status: "In Progress" as const,
        progress: 50,
        targetDate: "2026-08-15",
        items: ["Pressure Transmitter Wiring", "Remote Gateway & HMI Panel Box"],
      },
    ];
    for (let si = 0; si < siteDefs.length; si++) {
      const site = siteDefs[si];
      const siteId = `site_${crypto.randomUUID()}`;
      await tx.insert(schema.sites).values({
        id: siteId,
        phaseDetailId,
        name: site.name,
        status: site.status,
        progress: site.progress,
        targetDate: site.targetDate,
        sortOrder: si,
      });
      for (let ii = 0; ii < site.items.length; ii++) {
        await tx.insert(schema.siteItems).values({ id: `item_${crypto.randomUUID()}`, siteId, text: site.items[ii], sortOrder: ii });
      }
    }

    const steps = [
      "Complete pressure transmitter wiring and remote gateway/HMI panel installation at High Lift Clear Water WTP.",
      "Finalize Installation Phase sign-off ahead of the Configuration Phase.",
      "Proceed to system configuration, followed by functional and integration testing.",
      "Schedule Training and Commissioning activities with site operations staff.",
    ];
    for (let i = 0; i < steps.length; i++) {
      await tx.insert(schema.nextSteps).values({ id: `step_${crypto.randomUUID()}`, reportId, text: steps[i], sortOrder: i });
    }
  });

  console.log(`Seeded "Demo Project" (code ${DEMO_PROJECT_CODE}) owned by ${DEMO_EMAIL}.`);
  client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
