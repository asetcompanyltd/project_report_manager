"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Toggle } from "@/components/ui/Toggle";
import { useSettings, useUpdateSettings } from "@/hooks/useSettings";
import { useToast } from "@/context/ToastContext";
import { usePermissions } from "@/hooks/usePermissions";
import type { NotificationSettings } from "@/services/settings";

const ROWS: { key: "systemNotifications" | "emailNotifications" | "alertOnOverdue"; label: string; description: string }[] = [
  { key: "systemNotifications", label: "System Notifications", description: "Show in-app toast notifications for key actions." },
  { key: "emailNotifications", label: "Email Notifications", description: "Send email updates for important events (where configured)." },
  { key: "alertOnOverdue", label: "Overdue Alerts", description: "Highlight phases and sites that have passed their target date." },
];

export function NotificationsSection() {
  const { data } = useSettings();
  const update = useUpdateSettings();
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

  if (!form) return null;

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
    </Card>
  );
}
