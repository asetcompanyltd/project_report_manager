"use client";

import { useState } from "react";
import { History } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Toggle } from "@/components/ui/Toggle";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState } from "@/components/ui/EmptyState";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { useSettings, useUpdateSettings, useAuditLog } from "@/hooks/useSettings";
import { useToast } from "@/context/ToastContext";
import { usePermissions } from "@/hooks/usePermissions";

export function SystemSection() {
  const { data } = useSettings();
  const update = useUpdateSettings();
  const showToast = useToast();
  const { can } = usePermissions();
  const canEdit = can("settings", "edit");

  const [form, setForm] = useState(data?.system);
  const [syncedFrom, setSyncedFrom] = useState(data?.system);
  if (data?.system && data.system !== syncedFrom) {
    setSyncedFrom(data.system);
    setForm(data.system);
  }

  const [page, setPage] = useState(1);
  const { data: auditData, isLoading } = useAuditLog(page);

  async function handleSave() {
    if (!form) return;
    await update.mutateAsync({ key: "system", values: form });
    showToast("System settings saved");
  }

  return (
    <div className="space-y-6">
      {form && (
        <Card title="System" description="Data retention and audit logging.">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100">Audit Logging</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Record administrative actions for accountability.</p>
            </div>
            <Toggle checked={form.auditLogEnabled} onChange={(v) => setForm({ ...form, auditLogEnabled: v })} disabled={!canEdit} />
          </div>
          <FormField label="Data Retention" hint="days" className="mt-4 max-w-xs">
            <input
              type="number"
              min={1}
              value={form.dataRetentionDays}
              onChange={(e) => setForm({ ...form, dataRetentionDays: Number(e.target.value) })}
              disabled={!canEdit}
            />
          </FormField>
          {canEdit && (
            <div className="mt-4">
              <Button variant="primary" size="sm" onClick={handleSave} loading={update.isPending}>
                Save System Settings
              </Button>
            </div>
          )}
        </Card>
      )}

      <Card title="Audit Log" description="Recent administrative activity." noPadding>
        {isLoading ? (
          <div className="p-5">
            <TableSkeleton rows={5} />
          </div>
        ) : !auditData || auditData.entries.length === 0 ? (
          <EmptyState icon={History} title="No activity yet" description="Administrative actions will appear here." />
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {auditData.entries.map((entry) => (
              <li key={entry.id} className="flex flex-col gap-0.5 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-slate-800 dark:text-slate-100">{entry.details || entry.action}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {entry.userName ?? "System"} · {entry.action}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-slate-400 dark:text-slate-500">{new Date(entry.createdAt).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
        <div className="p-4">
          <Pagination page={page} pageCount={auditData && auditData.entries.length === auditData.pageSize ? page + 1 : page} onChange={setPage} />
        </div>
      </Card>
    </div>
  );
}
