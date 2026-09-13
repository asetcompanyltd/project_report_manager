"use client";

import { useMemo, useState } from "react";
import { Plus, ShieldCheck, Trash2, Lock } from "lucide-react";
import { useRoles, useUpdateRole, useRolePermissions, useUpdateRolePermissions } from "@/hooks/useRoles";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { EmptyState } from "@/components/ui/EmptyState";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { FormField } from "@/components/ui/FormField";
import { useToast } from "@/context/ToastContext";
import { usePermissions } from "@/hooks/usePermissions";
import { NewRoleDialog } from "@/components/roles/NewRoleDialog";
import { DeleteRoleDialog } from "@/components/roles/DeleteRoleDialog";
import { PermissionMatrix, type MatrixValue } from "@/components/roles/PermissionMatrix";
import { PERMISSION_MODULES, type PermissionAction, type PermissionModule } from "@/types/permissions";
import type { Role } from "@/services/roles";

function toMatrixValue(rows: { module: PermissionModule; canView: boolean; canCreate: boolean; canEdit: boolean; canDelete: boolean }[]): MatrixValue {
  const matrix: MatrixValue = {};
  for (const m of PERMISSION_MODULES) matrix[m] = { view: false, create: false, edit: false, delete: false };
  for (const row of rows) {
    matrix[row.module] = { view: row.canView, create: row.canCreate, edit: row.canEdit, delete: row.canDelete };
  }
  return matrix;
}

export default function RolesPage() {
  const { data: roles, isLoading } = useRoles();
  const { can } = usePermissions();
  const showToast = useToast();
  const updateRole = useUpdateRole();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [deleting, setDeleting] = useState<Role | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const selectedRole = useMemo(() => roles?.find((r) => r.id === selectedId) ?? null, [roles, selectedId]);

  // Default to the first role once the list loads, if nothing is selected yet.
  if (!selectedId && roles && roles.length > 0) {
    setSelectedId(roles[0].id);
  }

  // Reset the editable fields whenever a different role is selected (by id, not object identity,
  // so an incidental list refetch doesn't clobber in-progress edits).
  const [loadedRoleId, setLoadedRoleId] = useState<string | null>(null);
  if (selectedRole && selectedRole.id !== loadedRoleId) {
    setLoadedRoleId(selectedRole.id);
    setName(selectedRole.name);
    setDescription(selectedRole.description);
  }

  const { data: permissionRows } = useRolePermissions(selectedId);
  const updatePermissions = useUpdateRolePermissions();
  const [matrix, setMatrix] = useState<MatrixValue>({});
  const [syncedRows, setSyncedRows] = useState(permissionRows);
  if (permissionRows && permissionRows !== syncedRows) {
    setSyncedRows(permissionRows);
    setMatrix(toMatrixValue(permissionRows));
  }

  const canEdit = can("roles", "edit");
  const canCreate = can("roles", "create");
  const canDelete = can("roles", "delete");

  function toggle(module: PermissionModule, action: PermissionAction) {
    setMatrix((prev) => ({ ...prev, [module]: { ...prev[module], [action]: !prev[module]?.[action] } }));
  }

  async function saveDetails() {
    if (!selectedRole) return;
    await updateRole.mutateAsync({ id: selectedRole.id, input: { name, description } });
    showToast("Role updated");
  }

  async function savePermissions() {
    if (!selectedRole) return;
    const permissions = PERMISSION_MODULES.map((module) => ({
      module,
      view: matrix[module]?.view ?? false,
      create: matrix[module]?.create ?? false,
      edit: matrix[module]?.edit ?? false,
      delete: matrix[module]?.delete ?? false,
    }));
    await updatePermissions.mutateAsync({ id: selectedRole.id, permissions });
    showToast("Permissions updated");
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Projects", href: "/projects" }, { label: "Roles & Permissions" }]} />
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Roles & Permissions</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Configure what each role can view, create, edit, and delete.
          </p>
        </div>
        {canCreate && (
          <Button variant="primary" onClick={() => setShowNew(true)}>
            <Plus className="size-4" />
            Add New Role
          </Button>
        )}
      </header>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <CardSkeleton />
          <div className="lg:col-span-2">
            <CardSkeleton />
          </div>
        </div>
      ) : !roles || roles.length === 0 ? (
        <Card>
          <EmptyState icon={ShieldCheck} title="No roles yet" description="Create your first role to get started." />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card title="Roles" noPadding className="lg:col-span-1">
            <ul className="max-h-[560px] divide-y divide-slate-100 overflow-y-auto dark:divide-slate-800">
              {roles.map((role) => (
                <li key={role.id}>
                  <button
                    onClick={() => setSelectedId(role.id)}
                    className={[
                      "flex w-full items-start justify-between gap-2 px-4 py-3 text-left transition-colors",
                      selectedId === role.id ? "bg-indigo-50 dark:bg-indigo-500/10" : "hover:bg-slate-50 dark:hover:bg-slate-800/60",
                    ].join(" ")}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{role.name}</p>
                        {role.isSystem && <Lock className="size-3 shrink-0 text-slate-400" />}
                      </div>
                      <p className="truncate text-xs text-slate-500 dark:text-slate-400">{role.description || "No description"}</p>
                    </div>
                    <Badge color={role.status === "Active" ? "green" : "slate"}>{role.status}</Badge>
                  </button>
                </li>
              ))}
            </ul>
          </Card>

          <div className="space-y-6 lg:col-span-2">
            {selectedRole && (
              <>
                <Card
                  title="Role Details"
                  actions={
                    canDelete &&
                    !selectedRole.isSystem && (
                      <Button variant="danger" size="sm" onClick={() => setDeleting(selectedRole)}>
                        <Trash2 className="size-3.5" />
                        Delete
                      </Button>
                    )
                  }
                >
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField label="Role Name">
                      <input type="text" value={name} onChange={(e) => setName(e.target.value)} disabled={!canEdit || selectedRole.isSystem} />
                    </FormField>
                    <FormField label="Status">
                      <select
                        value={selectedRole.status}
                        disabled={!canEdit}
                        onChange={(e) => updateRole.mutate({ id: selectedRole.id, input: { status: e.target.value as "Active" | "Inactive" } })}
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </FormField>
                  </div>
                  <FormField label="Description" className="mt-4">
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} disabled={!canEdit} />
                  </FormField>
                  {canEdit && !selectedRole.isSystem && (
                    <div className="mt-4">
                      <Button variant="secondary" size="sm" onClick={saveDetails} loading={updateRole.isPending}>
                        Save Details
                      </Button>
                    </div>
                  )}
                  {selectedRole.isSystem && (
                    <p className="mt-3 text-xs text-slate-400">This is a predefined role — its name can&apos;t be changed, but permissions below are fully configurable.</p>
                  )}
                </Card>

                <Card
                  title="Permissions"
                  description="Applies to every user assigned this role."
                  actions={
                    canEdit && (
                      <Button variant="primary" size="sm" onClick={savePermissions} loading={updatePermissions.isPending}>
                        Save Permissions
                      </Button>
                    )
                  }
                >
                  <PermissionMatrix value={matrix} onToggle={toggle} disabled={!canEdit} />
                </Card>
              </>
            )}
          </div>
        </div>
      )}

      <NewRoleDialog open={showNew} onClose={() => setShowNew(false)} onCreated={setSelectedId} />
      <DeleteRoleDialog
        role={deleting}
        roles={roles ?? []}
        onClose={() => {
          setDeleting(null);
          if (deleting?.id === selectedId) setSelectedId(null);
        }}
      />
    </div>
  );
}
