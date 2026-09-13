"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { useDeleteRole } from "@/hooks/useRoles";
import { ApiClientError } from "@/services/apiClient";
import type { Role } from "@/services/roles";

export function DeleteRoleDialog({
  role,
  roles,
  onClose,
}: {
  role: Role | null;
  roles: Role[];
  onClose: () => void;
}) {
  const deleteRole = useDeleteRole();
  const [error, setError] = useState<string | null>(null);
  const [needsReassign, setNeedsReassign] = useState<number | null>(null);
  const [reassignToRoleId, setReassignToRoleId] = useState("");

  const otherRoles = roles.filter((r) => r.id !== role?.id);

  async function attemptDelete() {
    if (!role) return;
    setError(null);
    try {
      await deleteRole.mutateAsync({ id: role.id, reassignToRoleId: needsReassign ? reassignToRoleId : undefined });
      handleClose();
    } catch (err) {
      if (err instanceof ApiClientError && err.code === "ROLE_IN_USE") {
        const match = err.message.match(/^(\d+)/);
        setNeedsReassign(match ? Number(match[1]) : 1);
        setReassignToRoleId(otherRoles[0]?.id ?? "");
      } else {
        setError(err instanceof ApiClientError ? err.message : "Could not delete role.");
      }
    }
  }

  function handleClose() {
    setError(null);
    setNeedsReassign(null);
    setReassignToRoleId("");
    onClose();
  }

  return (
    <Modal
      open={!!role}
      title="Delete Role"
      description="This action is permanent and cannot be undone."
      onClose={handleClose}
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} type="button">
            Cancel
          </Button>
          <Button
            variant="danger-solid"
            onClick={attemptDelete}
            loading={deleteRole.isPending}
            disabled={needsReassign !== null && !reassignToRoleId}
          >
            {needsReassign !== null ? "Reassign & Delete" : "Delete Role"}
          </Button>
        </>
      }
    >
      {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">{error}</div>}

      {needsReassign === null ? (
        <div className="flex gap-3 rounded-lg border border-red-200 bg-red-50 p-3.5 dark:border-red-500/30 dark:bg-red-500/10">
          <AlertTriangle className="size-5 shrink-0 text-red-500" />
          <p className="text-sm text-red-700 dark:text-red-400">
            This permanently deletes the role <b>{role?.name}</b>.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3.5 dark:border-amber-500/30 dark:bg-amber-500/10">
            <AlertTriangle className="size-5 shrink-0 text-amber-500" />
            <p className="text-sm text-amber-800 dark:text-amber-400">
              {needsReassign} user(s) currently have the &quot;{role?.name}&quot; role. Choose a role to move them to before
              deleting.
            </p>
          </div>
          <FormField label="Reassign affected users to">
            <select value={reassignToRoleId} onChange={(e) => setReassignToRoleId(e.target.value)}>
              {otherRoles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </FormField>
        </div>
      )}
    </Modal>
  );
}
