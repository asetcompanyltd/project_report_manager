"use client";

import { Sun, Moon, Monitor, Check } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { useTheme } from "@/context/ThemeContext";
import type { ThemePreference } from "@/types/project";

const OPTIONS: { value: ThemePreference; label: string; description: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light Mode", description: "Clean, bright interface.", icon: Sun },
  { value: "dark", label: "Dark Mode", description: "True dark backgrounds across every page.", icon: Moon },
  { value: "system", label: "System", description: "Match your device's setting.", icon: Monitor },
];

export function AppearanceSection() {
  const { theme, setTheme } = useTheme();

  return (
    <Card title="Appearance" description="Choose how Report Manager looks on this account.">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {OPTIONS.map((opt) => {
          const active = theme === opt.value;
          const Icon = opt.icon;
          return (
            <button
              key={opt.value}
              onClick={() => setTheme(opt.value)}
              className={[
                "relative rounded-xl border p-4 text-left transition-colors",
                active
                  ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10"
                  : "border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600",
              ].join(" ")}
            >
              {active && (
                <span className="absolute right-3 top-3 flex size-5 items-center justify-center rounded-full bg-indigo-600 text-white">
                  <Check className="size-3" />
                </span>
              )}
              <Icon className="size-5 text-slate-500 dark:text-slate-400" />
              <p className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-100">{opt.label}</p>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{opt.description}</p>
            </button>
          );
        })}
      </div>
      <p className="mt-4 text-xs text-slate-400 dark:text-slate-500">
        Your choice is saved to your account and applies automatically the next time you log in, on any device.
      </p>
    </Card>
  );
}
