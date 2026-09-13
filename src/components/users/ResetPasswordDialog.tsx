"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { useResetPassword } from "@/hooks/useUsers";
import { useToast } from "@/context/ToastContext";
import { ApiClientError } from "@/services/apiClient";
import type { ManagedUser } from "@/services/users";

export function ResetPasswordDialog({ user, onClose }: { user: ManagedUser | null; onClose: () => void }) {
  const resetPassword = useResetPassword();
  const showToast = useToast();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleClose() {
    setPassword("");
    setConfirmPassword("");
    setError(null);
    onClose();
  }

  async function handleSubmit() {
    if (!user) return;
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    try {
      await resetPassword.mutateAsync({ id: user.id, password });
      showToast(`Password reset for ${user.name}`);
      handleClose();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Could not reset password.");
    }
  }

  return (
    <Modal
      open={!!user}
      title="Reset Password"
      description={user ? `Set a new password for ${user.name}.` : undefined}
      onClose={handleClose}
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} type="button">
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} loading={resetPassword.isPending}>
            Reset Password
          </Button>
        </>
      }
    >
      {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">{error}</div>}
      <div className="space-y-4">
        <FormField label="New Password" required>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} autoFocus />
        </FormField>
        <FormField label="Confirm Password" required>
          <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} minLength={8} />
        </FormField>
      </div>
    </Modal>
  );
}
