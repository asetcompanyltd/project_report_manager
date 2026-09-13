"use client";

import Link from "next/link";
import { Users, ShieldCheck, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { usePermissions } from "@/hooks/usePermissions";

export function UsersAccessSection() {
  const { can } = usePermissions();

  return (
    <Card title="Users & Access" description="Manage who has access to this system and what they can do.">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {can("users", "view") && (
          <Link
            href="/users"
            className="flex items-center justify-between rounded-xl border border-slate-200 p-4 transition-colors hover:border-indigo-300 hover:bg-indigo-50/50 dark:border-slate-700 dark:hover:border-indigo-500/50 dark:hover:bg-indigo-500/5"
          >
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
                <Users className="size-[18px]" />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Manage Users</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Add accounts, assign roles, reset passwords</p>
              </div>
            </div>
            <ArrowRight className="size-4 text-slate-400" />
          </Link>
        )}
        {can("roles", "view") && (
          <Link
            href="/roles"
            className="flex items-center justify-between rounded-xl border border-slate-200 p-4 transition-colors hover:border-indigo-300 hover:bg-indigo-50/50 dark:border-slate-700 dark:hover:border-indigo-500/50 dark:hover:bg-indigo-500/5"
          >
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
                <ShieldCheck className="size-[18px]" />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Roles & Permissions</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Create roles and configure module access</p>
              </div>
            </div>
            <ArrowRight className="size-4 text-slate-400" />
          </Link>
        )}
      </div>
    </Card>
  );
}
