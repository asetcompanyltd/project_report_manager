"use client";

import { useState, type FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { useCreateRole } from "@/hooks/useRoles";
import { ApiClientError } from "@/services/apiClient";

export function NewRoleDialog({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (roleId: string) => void;
}) {
  const createRole = useCreateRole();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setName("");
    setDescription("");
    setError(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const role = await createRole.mutateAsync({ name, description });
      reset();
      onClose();
      onCreated(role.id);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Could not create role.");
    }
  }

  return (
    <Modal
      open={open}
      title="Add New Role"
      description="Create a project-specific role, then configure its permissions."
      onClose={() => {
        reset();
        onClose();
      }}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button variant="primary" form="new-role-form" type="submit" loading={createRole.isPending}>
            Create Role
          </Button>
        </>
      }
    >
      {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">{error}</div>}
      <form id="new-role-form" onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Role Name" required>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Contract Manager" required autoFocus />
        </FormField>
        <FormField label="Role Description">
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="What is this role responsible for?" />
        </FormField>
      </form>
    </Modal>
  );
}
