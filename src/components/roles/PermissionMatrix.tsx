"use client";

import { Check } from "lucide-react";
import { PERMISSION_MODULES, PERMISSION_ACTIONS, MODULE_LABELS, type PermissionAction, type PermissionModule } from "@/types/permissions";

export interface MatrixValue {
  [module: string]: { view: boolean; create: boolean; edit: boolean; delete: boolean };
}

const ACTION_LABELS: Record<PermissionAction, string> = { view: "View", create: "Create", edit: "Edit", delete: "Delete" };

export function PermissionMatrix({
  value,
  onToggle,
  disabled,
}: {
  value: MatrixValue;
  onToggle: (module: PermissionModule, action: PermissionAction) => void;
  disabled?: boolean;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
      <table className="w-full min-w-[420px] border-collapse text-sm">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800">
            <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Module
            </th>
            {PERMISSION_ACTIONS.map((action) => (
              <th key={action} className="px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {ACTION_LABELS[action]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {PERMISSION_MODULES.map((module) => (
            <tr key={module} className="border-t border-slate-100 dark:border-slate-800">
              <td className="px-4 py-2.5 font-medium text-slate-700 dark:text-slate-200">{MODULE_LABELS[module]}</td>
              {PERMISSION_ACTIONS.map((action) => {
                const checked = value[module]?.[action] ?? false;
                return (
                  <td key={action} className="px-4 py-2.5 text-center">
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => onToggle(module, action)}
                      aria-pressed={checked}
                      aria-label={`${ACTION_LABELS[action]} ${MODULE_LABELS[module]}`}
                      className={[
                        "inline-flex size-6 items-center justify-center rounded-md border transition-colors disabled:cursor-not-allowed disabled:opacity-50",
                        checked
                          ? "border-indigo-600 bg-indigo-600 text-white"
                          : "border-slate-300 bg-white text-transparent hover:border-slate-400 dark:border-slate-600 dark:bg-slate-800",
                      ].join(" ")}
                    >
                      <Check className="size-3.5" />
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
