import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { verifySessionToken, clearSessionCookie } from "@/lib/session";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { getEffectivePermissions, type PermissionModule } from "@/lib/permissions";

// Node.js runtime (not the default Edge runtime) so this can query the database directly —
// needed for real route-level enforcement, not just a client-side redirect.
export const runtime = "nodejs";

const SESSION_COOKIE = "wtp_session";
const PUBLIC_PATHS = ["/login", "/register", "/forgot-password"];

const ADMIN_MODULE_PATHS: [prefix: string, module: PermissionModule][] = [
  ["/users", "users"],
  ["/roles", "roles"],
  ["/settings", "settings"],
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const userId = token ? await verifySessionToken(token) : null;

  const isPublicPath = PUBLIC_PATHS.includes(pathname);

  if (!userId && !isPublicPath) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (userId && isPublicPath) {
    const url = req.nextUrl.clone();
    url.pathname = "/projects";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (userId && !isPublicPath) {
    const [user] = await db.select({ status: users.status }).from(users).where(eq(users.id, userId)).limit(1);

    // Account was deactivated after this session started — end it now, not just at next login.
    if (!user || user.status === "Inactive") {
      await clearSessionCookie();
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.search = "";
      return NextResponse.redirect(url);
    }

    const adminMatch = ADMIN_MODULE_PATHS.find(([prefix]) => pathname === prefix || pathname.startsWith(prefix + "/"));
    if (adminMatch) {
      const permissions = await getEffectivePermissions(userId);
      if (!permissions[adminMatch[1]].view) {
        const url = req.nextUrl.clone();
        url.pathname = "/projects";
        url.search = "";
        return NextResponse.redirect(url);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
