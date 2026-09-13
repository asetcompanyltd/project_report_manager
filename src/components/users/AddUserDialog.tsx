"use client";

import { useState, type FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { useCreateUser } from "@/hooks/useUsers";
import { ApiClientError } from "@/services/apiClient";
import type { Role } from "@/services/roles";

export function AddUserDialog({ open, onClose, roles }: { open: boolean; onClose: () => void; roles: Role[] }) {
  const createUser = useCreateUser();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [roleId, setRoleId] = useState(roles[0]?.id ?? "");
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setName("");
    setUsername("");
    setEmail("");
    setPhone("");
    setPassword("");
    setConfirmPassword("");
    setRoleId(roles[0]?.id ?? "");
    setError(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!roleId) {
      setError("Select a role.");
      return;
    }
    try {
      await createUser.mutateAsync({ name, username: username || undefined, email, phone: phone || undefined, password, roleId });
      reset();
      onClose();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Could not create user.");
    }
  }

  return (
    <Modal
      open={open}
      title="Add User"
      description="Create an account and assign a role — its permissions apply automatically."
      size="md"
      onClose={() => {
        reset();
        onClose();
      }}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button variant="primary" form="add-user-form" type="submit" loading={createUser.isPending}>
            Create User
          </Button>
        </>
      }
    >
      {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">{error}</div>}
      <form id="add-user-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Full Name" required>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
          </FormField>
          <FormField label="Username" hint="optional">
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="e.g. jdoe" />
          </FormField>
          <FormField label="Email" required>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </FormField>
          <FormField label="Phone" hint="optional">
            <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </FormField>
          <FormField label="Password" required>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} required />
          </FormField>
          <FormField label="Confirm Password" required>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} minLength={8} required />
          </FormField>
        </div>
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
