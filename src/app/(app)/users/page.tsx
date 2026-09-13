"use client";

import { useMemo, useState } from "react";
import { Plus, Users as UsersIcon, Pencil, KeyRound, ShieldCheck, Power } from "lucide-react";
import { useUsers, useSetUserStatus } from "@/hooks/useUsers";
import { useRoles } from "@/hooks/useRoles";
import { usePermissions } from "@/hooks/usePermissions";
import { useConfirm } from "@/hooks/useConfirm";
import { useToast } from "@/context/ToastContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SearchInput } from "@/components/ui/SearchInput";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { Tooltip } from "@/components/ui/Tooltip";
import { AddUserDialog } from "@/components/users/AddUserDialog";
import { EditUserDialog } from "@/components/users/EditUserDialog";
import { ResetPasswordDialog } from "@/components/users/ResetPasswordDialog";
import { UserPermissionsDialog } from "@/components/users/UserPermissionsDialog";
import type { ManagedUser } from "@/services/users";

const PAGE_SIZE = 10;

export default function UsersPage() {
  const { data: users, isLoading } = useUsers();
  const { data: roles } = useRoles();
  const { can } = usePermissions();
  const confirm = useConfirm();
  const showToast = useToast();
  const setStatus = useSetUserStatus();

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);

  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<ManagedUser | null>(null);
  const [resetting, setResetting] = useState<ManagedUser | null>(null);
  const [managingPermissions, setManagingPermissions] = useState<ManagedUser | null>(null);

  const canCreate = can("users", "create");
  const canEdit = can("users", "edit");
  const canDeactivate = can("users", "delete") || canEdit;

  const filtered = useMemo(() => {
    const list = users ?? [];
    const term = search.trim().toLowerCase();
    return list.filter((u) => {
      const matchesTerm =
        !term || u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term) || (u.username ?? "").toLowerCase().includes(term);
      const matchesRole = roleFilter === "All" || u.roleId === roleFilter;
      const matchesStatus = statusFilter === "All" || u.status === statusFilter;
      return matchesTerm && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  async function handleToggleStatus(user: ManagedUser) {
    const activating = user.status === "Inactive";
    const ok = await confirm({
      title: activating ? `Activate ${user.name}?` : `Deactivate ${user.name}?`,
      description: activating
        ? "They will be able to log in again."
        : "They will be immediately signed out and unable to log in until reactivated.",
      confirmLabel: activating ? "Activate" : "Deactivate",
      danger: !activating,
    });
    if (!ok) return;
    await setStatus.mutateAsync({ id: user.id, status: activating ? "Active" : "Inactive" });
    showToast(activating ? "User activated" : "User deactivated");
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Projects", href: "/projects" }, { label: "Users" }]} />
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Users</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage accounts, roles, and access for your team.</p>
        </div>
        {canCreate && (
          <Button variant="primary" onClick={() => setShowAdd(true)}>
            <Plus className="size-4" />
            Add User
          </Button>
        )}
      </header>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by name, email, or username…" className="sm:w-72" />
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="!w-auto sm:w-52" aria-label="Filter by role">
          <option value="All">All roles</option>
          {roles?.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="!w-auto sm:w-40" aria-label="Filter by status">
          <option value="All">All statuses</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      <Card noPadding>
        {isLoading ? (
          <div className="p-5">
            <TableSkeleton rows={5} />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={UsersIcon} title="No users found" description="Try a different search term or filter." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800">
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">User</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Role</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Status</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Last Login</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Created</th>
                  <th className="px-4 py-2.5"></th>
                </tr>
              </thead>
              <tbody>
                {paged.map((u) => (
                  <tr key={u.id} className="border-t border-slate-100 dark:border-slate-800">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800 dark:text-slate-100">{u.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{u.email}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{u.roleName ?? "—"}</td>
                    <td className="px-4 py-3">
                      <Badge color={u.status === "Active" ? "green" : "slate"}>{u.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
                      {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : "Never"}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        {canEdit && (
                          <Tooltip label="Edit user">
                            <Button variant="icon" size="sm" onClick={() => setEditing(u)} aria-label="Edit user">
                              <Pencil className="size-4" />
                            </Button>
                          </Tooltip>
                        )}
                        {canEdit && (
                          <Tooltip label="Permissions">
                            <Button variant="icon" size="sm" onClick={() => setManagingPermissions(u)} aria-label="Manage permissions">
                              <ShieldCheck className="size-4" />
                            </Button>
                          </Tooltip>
                        )}
                        {canEdit && (
                          <Tooltip label="Reset password">
                            <Button variant="icon" size="sm" onClick={() => setResetting(u)} aria-label="Reset password">
                              <KeyRound className="size-4" />
                            </Button>
                          </Tooltip>
                        )}
                        {canDeactivate && (
                          <Tooltip label={u.status === "Active" ? "Deactivate" : "Activate"}>
                            <Button variant="icon" size="sm" onClick={() => handleToggleStatus(u)} aria-label="Toggle status">
                              <Power className="size-4" />
                            </Button>
                          </Tooltip>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Pagination page={currentPage} pageCount={pageCount} onChange={setPage} />

      <AddUserDialog open={showAdd} onClose={() => setShowAdd(false)} roles={roles ?? []} />
      <EditUserDialog user={editing} roles={roles ?? []} onClose={() => setEditing(null)} />
      <ResetPasswordDialog user={resetting} onClose={() => setResetting(null)} />
      <UserPermissionsDialog user={managingPermissions} onClose={() => setManagingPermissions(null)} />
    </div>
  );
}
