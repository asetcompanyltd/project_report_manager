"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { useSettings, useUpdateSettings } from "@/hooks/useSettings";
import { useToast } from "@/context/ToastContext";
import { usePermissions } from "@/hooks/usePermissions";

export function GeneralSection() {
  const { data } = useSettings();
  const update = useUpdateSettings();
  const showToast = useToast();
  const { can } = usePermissions();
  const canEdit = can("settings", "edit");

  const [form, setForm] = useState(data?.general);
  const [syncedFrom, setSyncedFrom] = useState(data?.general);
  if (data?.general && data.general !== syncedFrom) {
    setSyncedFrom(data.general);
    setForm(data.general);
  }

  if (!form) return null;

  async function handleSave() {
    if (!form) return;
    await update.mutateAsync({ key: "general", values: form });
    showToast("General settings saved");
  }

  return (
    <Card title="General Settings" description="Basic system, organization, and formatting information.">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="System Name">
          <input type="text" value={form.systemName} onChange={(e) => setForm({ ...form, systemName: e.target.value })} disabled={!canEdit} />
        </FormField>
        <FormField label="Company / Organization Name">
          <input type="text" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} disabled={!canEdit} />
        </FormField>
        <FormField label="Contact Email">
          <input type="email" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} disabled={!canEdit} />
        </FormField>
        <FormField label="Contact Phone">
          <input type="text" value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} disabled={!canEdit} />
        </FormField>
        <FormField label="Date Format">
          <select value={form.dateFormat} onChange={(e) => setForm({ ...form, dateFormat: e.target.value })} disabled={!canEdit}>
            <option value="DD-MMM-YYYY">DD-MMM-YYYY (13-Sep-2026)</option>
            <option value="DD/MM/YYYY">DD/MM/YYYY (13/09/2026)</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY (09/13/2026)</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD (2026-09-13)</option>
          </select>
        </FormField>
        <FormField label="Time Format">
          <select value={form.timeFormat} onChange={(e) => setForm({ ...form, timeFormat: e.target.value })} disabled={!canEdit}>
            <option value="24h">24-hour</option>
            <option value="12h">12-hour (AM/PM)</option>
          </select>
        </FormField>
      </div>
      <FormField label="Company / Project Information" className="mt-4">
        <textarea value={form.companyInfo} onChange={(e) => setForm({ ...form, companyInfo: e.target.value })} rows={3} disabled={!canEdit} />
      </FormField>
      {canEdit && (
        <div className="mt-4">
          <Button variant="primary" size="sm" onClick={handleSave} loading={update.isPending}>
            Save General Settings
          </Button>
        </div>
      )}
    </Card>
  );
}
