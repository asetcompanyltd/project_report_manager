"use client";

import { useState } from "react";
import { Settings2, Palette, Users, Bell, Lock, Database } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { GeneralSection } from "@/components/settings/GeneralSection";
import { AppearanceSection } from "@/components/settings/AppearanceSection";
import { UsersAccessSection } from "@/components/settings/UsersAccessSection";
import { NotificationsSection } from "@/components/settings/NotificationsSection";
import { SecuritySection } from "@/components/settings/SecuritySection";
import { SystemSection } from "@/components/settings/SystemSection";

const TABS = [
  { key: "general", label: "General", icon: Settings2, content: GeneralSection },
  { key: "appearance", label: "Appearance", icon: Palette, content: AppearanceSection },
  { key: "access", label: "Users & Access", icon: Users, content: UsersAccessSection },
  { key: "notifications", label: "Notifications", icon: Bell, content: NotificationsSection },
  { key: "security", label: "Security", icon: Lock, content: SecuritySection },
  { key: "system", label: "System", icon: Database, content: SystemSection },
] as const;

export default function SettingsPage() {
  const [active, setActive] = useState<(typeof TABS)[number]["key"]>("general");
  const ActiveContent = TABS.find((t) => t.key === active)?.content ?? GeneralSection;

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Projects", href: "/projects" }, { label: "Settings" }]} />
      <header>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Settings</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Configure system, appearance, notifications, and security.</p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr]">
        <nav className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = active === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActive(tab.key)}
                className={[
                  "flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800",
                ].join(" ")}
              >
                <Icon className="size-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>

        <div>
          <ActiveContent />
        </div>
      </div>
    </div>
  );
}
