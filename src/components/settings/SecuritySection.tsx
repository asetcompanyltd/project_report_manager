"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Toggle } from "@/components/ui/Toggle";
import { useSettings, useUpdateSettings } from "@/hooks/useSettings";
import { useToast } from "@/context/ToastContext";
import { usePermissions } from "@/hooks/usePermissions";

export function SecuritySection() {
  const { data } = useSettings();
  const update = useUpdateSettings();
  const showToast = useToast();
  const { can } = usePermissions();
  const canEdit = can("settings", "edit");

  const [form, setForm] = useState(data?.security);
  const [syncedFrom, setSyncedFrom] = useState(data?.security);
  if (data?.security && data.security !== syncedFrom) {
    setSyncedFrom(data.security);
    setForm(data.security);
  }

  if (!form) return null;

  async function handleSave() {
    if (!form) return;
    await update.mutateAsync({ key: "security", values: form });
    showToast("Security settings saved");
  }

  return (
    <Card title="Security" description="Password policy, session, and login protections.">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Minimum Password Length" hint="characters">
          <input
            type="number"
            min={6}
            max={64}
            value={form.minPasswordLength}
            onChange={(e) => setForm({ ...form, minPasswordLength: Number(e.target.value) })}
            disabled={!canEdit}
          />
        </FormField>
        <FormField label="Session Timeout" hint="minutes">
          <input
            type="number"
            min={5}
            value={form.sessionTimeoutMinutes}
            onChange={(e) => setForm({ ...form, sessionTimeoutMinutes: Number(e.target.value) })}
            disabled={!canEdit}
          />
        </FormField>
      </div>

      <div className="mt-4 flex items-center justify-between gap-4 border-t border-slate-100 pt-4 dark:border-slate-800">
        <div>
          <p className="text-sm font-medium text-slate-800 dark:text-slate-100">Require Strong Passwords</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">New and reset passwords must include a mix of letters and numbers.</p>
        </div>
        <Toggle checked={form.requireStrongPassword} onChange={(v) => setForm({ ...form, requireStrongPassword: v })} disabled={!canEdit} />
      </div>

      {canEdit && (
        <div className="mt-4">
          <Button variant="primary" size="sm" onClick={handleSave} loading={update.isPending}>
            Save Security Settings
          </Button>
        </div>
      )}
    </Card>
  );
}
