import { useAuth } from "@/context/AuthContext";
import type { PermissionAction, PermissionModule } from "@/types/permissions";

const EMPTY_FLAGS = { view: false, create: false, edit: false, delete: false };

/** Reads the current user's already-resolved permission matrix (from /api/auth/me) for UI gating. */
export function usePermissions() {
  const { user } = useAuth();

  function can(module: PermissionModule, action: PermissionAction): boolean {
    if (!user) return false;
    return (user.permissions?.[module] ?? EMPTY_FLAGS)[action];
  }

  return { can, permissions: user?.permissions ?? null };
}
