"use client";

import { useState, type FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { useUpdateUser } from "@/hooks/useUsers";
import { ApiClientError } from "@/services/apiClient";
import type { ManagedUser } from "@/services/users";
import type { Role } from "@/services/roles";

export function EditUserDialog({ user, roles, onClose }: { user: ManagedUser | null; roles: Role[]; onClose: () => void }) {
  const updateUser = useUpdateUser();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [roleId, setRoleId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [loadedUserId, setLoadedUserId] = useState<string | null>(null);
  if (user && user.id !== loadedUserId) {
    setLoadedUserId(user.id);
    setName(user.name);
    setUsername(user.username ?? "");
    setPhone(user.phone ?? "");
    setRoleId(user.roleId ?? "");
    setError(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    setError(null);
    try {
      await updateUser.mutateAsync({
        id: user.id,
        input: { name, username: username || null, phone: phone || null, roleId },
      });
      onClose();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Could not update user.");
    }
  }

  return (
    <Modal
      open={!!user}
      title="Edit User"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button variant="primary" form="edit-user-form" type="submit" loading={updateUser.isPending}>
            Save Changes
          </Button>
        </>
      }
    >
      {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">{error}</div>}
      <form id="edit-user-form" onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Full Name" required>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
        </FormField>
        <FormField label="Username">
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
        </FormField>
        <FormField label="Phone">
          <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </FormField>
        <FormField label="Email" hint="cannot be changed">
          <input type="email" value={user?.email ?? ""} disabled />
        </FormField>
        <FormField label="Role" required>
          <select value={roleId} onChange={(e) => setRoleId(e.target.value)} required>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </FormField>
      </form>
    </Modal>
  );
}
