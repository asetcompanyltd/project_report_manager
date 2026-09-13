"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useUserPermissions, useUpdateUserPermissions } from "@/hooks/useUsers";
import { useToast } from "@/context/ToastContext";
import { PERMISSION_MODULES, PERMISSION_ACTIONS, MODULE_LABELS, type PermissionAction, type PermissionModule } from "@/types/permissions";
import type { ManagedUser } from "@/services/users";

type OverrideState = "inherit" | "allow" | "deny";
type OverrideGrid = Record<PermissionModule, Record<PermissionAction, OverrideState>>;

function emptyGrid(): OverrideGrid {
  const grid = {} as OverrideGrid;
  for (const m of PERMISSION_MODULES) {
    grid[m] = { view: "inherit", create: "inherit", edit: "inherit", delete: "inherit" };
  }
  return grid;
}

const ACTION_LABELS: Record<PermissionAction, string> = { view: "View", create: "Create", edit: "Edit", delete: "Delete" };

export function UserPermissionsDialog({ user, onClose }: { user: ManagedUser | null; onClose: () => void }) {
  const { data } = useUserPermissions(user?.id ?? null);
  const updateOverrides = useUpdateUserPermissions();
  const showToast = useToast();
  const [grid, setGrid] = useState<OverrideGrid>(emptyGrid());
  const [syncedData, setSyncedData] = useState(data);
  if (data && data !== syncedData) {
    setSyncedData(data);
    const next = emptyGrid();
    for (const o of data.overrides as { module: PermissionModule; canView: boolean | null; canCreate: boolean | null; canEdit: boolean | null; canDelete: boolean | null }[]) {
      next[o.module] = {
        view: o.canView === null ? "inherit" : o.canView ? "allow" : "deny",
        create: o.canCreate === null ? "inherit" : o.canCreate ? "allow" : "deny",
        edit: o.canEdit === null ? "inherit" : o.canEdit ? "allow" : "deny",
        delete: o.canDelete === null ? "inherit" : o.canDelete ? "allow" : "deny",
      };
    }
    setGrid(next);
  }

  async function handleSave() {
    if (!user) return;
    const overrides = PERMISSION_MODULES.map((module) => {
      const toFlag = (s: OverrideState) => (s === "inherit" ? null : s === "allow");
      return {
        module,
        view: toFlag(grid[module].view),
        create: toFlag(grid[module].create),
        edit: toFlag(grid[module].edit),
        delete: toFlag(grid[module].delete),
      };
    });
    await updateOverrides.mutateAsync({ id: user.id, overrides });
    showToast("Permission overrides saved");
    onClose();
  }

  return (
    <Modal
      open={!!user}
      title="Individual Permissions"
      description={user ? `Override "${user.name}"'s role-based permissions for specific modules.` : undefined}
      size="lg"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} loading={updateOverrides.isPending}>
            Save Overrides
          </Button>
        </>
      }
    >
      <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">
        Leave a permission on <b>Inherit</b> to use the value from the user&apos;s role ({user?.roleName ?? "no role"}). Choose
        <b> Allow</b> or <b>Deny</b> to override it just for this user.
      </p>
      <div className="space-y-4">
        {PERMISSION_MODULES.map((module) => (
          <div key={module} className="rounded-lg border border-slate-200 p-3.5 dark:border-slate-700">
            <p className="mb-2.5 text-sm font-semibold text-slate-800 dark:text-slate-100">{MODULE_LABELS[module]}</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {PERMISSION_ACTIONS.map((action) => (
                <div key={action}>
                  <label className="mb-1 block text-[11px] font-medium text-slate-500 dark:text-slate-400">{ACTION_LABELS[action]}</label>
                  <select
                    value={grid[module][action]}
                    onChange={(e) =>
                      setGrid((prev) => ({ ...prev, [module]: { ...prev[module], [action]: e.target.value as OverrideState } }))
                    }
                    className="!py-1.5 !text-xs"
                  >
                    <option value="inherit">Inherit</option>
                    <option value="allow">Allow</option>
                    <option value="deny">Deny</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}
