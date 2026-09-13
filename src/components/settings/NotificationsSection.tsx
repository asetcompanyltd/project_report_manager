"use client";

import { useState } from "react";
import { Mail, Plus, Trash2, Send } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Toggle } from "@/components/ui/Toggle";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Tooltip } from "@/components/ui/Tooltip";
import { useSettings, useUpdateSettings, useSendTestEmail } from "@/hooks/useSettings";
import { useToast } from "@/context/ToastContext";
import { usePermissions } from "@/hooks/usePermissions";
import { ApiClientError } from "@/services/apiClient";
import type { NotificationSettings } from "@/services/settings";

const ROWS: { key: "systemNotifications" | "emailNotifications" | "alertOnOverdue"; label: string; description: string }[] = [
  { key: "systemNotifications", label: "System Notifications", description: "Show in-app toast notifications for key actions." },
  { key: "emailNotifications", label: "Email Notifications", description: "Send email updates for important events (where configured)." },
  { key: "alertOnOverdue", label: "Overdue Alerts", description: "Highlight phases and sites that have passed their target date." },
];

export function NotificationsSection() {
  const { data } = useSettings();
  const update = useUpdateSettings();
  const sendTestEmail = useSendTestEmail();
  const showToast = useToast();
  const { can } = usePermissions();
  const canEdit = can("settings", "edit");

  const [form, setForm] = useState<NotificationSettings | undefined>(data?.notifications);
  const [syncedFrom, setSyncedFrom] = useState(data?.notifications);
  if (data?.notifications && data.notifications !== syncedFrom) {
    setSyncedFrom(data.notifications);
    setForm(data.notifications);
  }

  async function handleToggle(key: keyof NotificationSettings, value: boolean) {
    if (!form) return;
    setForm({ ...form, [key]: value });
    await update.mutateAsync({ key: "notifications", values: { [key]: value } });
    showToast("Notification settings saved");
  }

  async function handleSaveEmailConfig() {
    if (!form) return;
    const recipientEmails = form.recipientEmails.map((e) => e.trim()).filter(Boolean);
    await update.mutateAsync({
      key: "notifications",
      values: { senderEmail: form.senderEmail.trim(), recipientEmails },
    });
    setForm({ ...form, recipientEmails });
    showToast("Email configuration saved");
  }

  async function handleSendTest() {
    if (!form) return;
    const recipientEmails = form.recipientEmails.map((e) => e.trim()).filter(Boolean);
    try {
      await sendTestEmail.mutateAsync({ senderEmail: form.senderEmail.trim(), recipientEmails });
      showToast("Test email sent — check the recipient inbox");
    } catch (err) {
      showToast(err instanceof ApiClientError ? err.message : "Could not send test email.", "error");
    }
  }

  function updateRecipient(index: number, value: string) {
    if (!form) return;
    const next = [...form.recipientEmails];
    next[index] = value;
    setForm({ ...form, recipientEmails: next });
  }

  function addRecipient() {
    if (!form) return;
    setForm({ ...form, recipientEmails: [...form.recipientEmails, ""] });
  }

  function removeRecipient(index: number) {
    if (!form) return;
    setForm({ ...form, recipientEmails: form.recipientEmails.filter((_, i) => i !== index) });
  }

  if (!form) return null;

  const hasValidConfig = form.senderEmail.trim().length > 0 && form.recipientEmails.some((e) => e.trim().length > 0);

  return (
    <Card title="Notifications" description="Control what triggers a notification in this system.">
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {ROWS.map((row) => (
          <div key={row.key} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
            <div>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{row.label}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{row.description}</p>
            </div>
            <Toggle checked={form[row.key]} onChange={(v) => handleToggle(row.key, v)} disabled={!canEdit || update.isPending} />
          </div>
        ))}
      </div>

      {form.emailNotifications && (
        <div className="mt-5 space-y-4 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
            <Mail className="size-4 text-slate-400 dark:text-slate-500" />
            Email Configuration
          </div>

          <FormField label="Sending Email" hint="the “from” address">
            <input
              type="email"
              value={form.senderEmail}
              onChange={(e) => setForm({ ...form, senderEmail: e.target.value })}
              placeholder="notifications@yourcompany.com"
              disabled={!canEdit}
            />
          </FormField>

          <div>
            <p className="mb-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400">Receiving Emails</p>
            <div className="space-y-2">
              {form.recipientEmails.length === 0 && (
                <p className="text-xs text-slate-400 dark:text-slate-500">No recipients yet — add at least one below.</p>
              )}
              {form.recipientEmails.map((email, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => updateRecipient(i, e.target.value)}
                    placeholder="someone@yourcompany.com"
                    disabled={!canEdit}
                  />
                  {canEdit && (
                    <Tooltip label="Remove">
                      <Button variant="icon" size="sm" onClick={() => removeRecipient(i)} aria-label="Remove recipient email">
                        <Trash2 className="size-4" />
                      </Button>
                    </Tooltip>
                  )}
                </div>
              ))}
            </div>
            {canEdit && (
              <div className="mt-2">
                <Button variant="ghost" size="sm" onClick={addRecipient}>
                  <Plus className="size-4" />
                  Add another email
                </Button>
              </div>
            )}
          </div>

          {canEdit && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Button variant="primary" size="sm" onClick={handleSaveEmailConfig} loading={update.isPending}>
                Save Email Configuration
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleSendTest}
                loading={sendTestEmail.isPending}
                disabled={!hasValidConfig}
              >
                <Send className="size-3.5" />
                Send Test Email
              </Button>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
