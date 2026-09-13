import { and, eq, ne } from "drizzle-orm";
import { db } from "@/db/client";
import { roles } from "@/db/schema";
import { DEFAULT_SELF_SIGNUP_ROLE_ID } from "@/lib/permissions";
import { withApiErrors } from "@/lib/api-response";

// Unauthenticated on purpose: the register page needs this list before a session exists.
// Only exposes id/name/description — never permissions — and always excludes Project Manager,
// the system administrator role, which is assigned only from the Users page.
export async function GET() {
  return withApiErrors(async () => {
    return db
      .select({ id: roles.id, name: roles.name, description: roles.description })
      .from(roles)
      .where(and(eq(roles.status, "Active"), ne(roles.id, DEFAULT_SELF_SIGNUP_ROLE_ID)))
      .orderBy(roles.name);
  });
}
