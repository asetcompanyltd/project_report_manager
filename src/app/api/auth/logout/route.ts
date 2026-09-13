import { clearSessionCookie } from "@/lib/session";
import { withApiErrors } from "@/lib/api-response";

export async function POST() {
  return withApiErrors(async () => {
    await clearSessionCookie();
    return { success: true };
  });
}
