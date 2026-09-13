"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FolderKanban, FileBarChart2, Users, ShieldCheck, Settings } from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";
import { useBranding } from "@/hooks/useSettings";
import type { PermissionModule } from "@/types/permissions";

const NAV_ITEMS: { label: string; href: string; icon: typeof FolderKanban; module: PermissionModule }[] = [
  { label: "Projects", href: "/projects", icon: FolderKanban, module: "projects" },
  { label: "Users", href: "/users", icon: Users, module: "users" },
  { label: "Roles & Permissions", href: "/roles", icon: ShieldCheck, module: "roles" },
  { label: "Settings", href: "/settings", icon: Settings, module: "settings" },
];

export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { can } = usePermissions();
  const { data: branding } = useBranding();

  const visibleItems = NAV_ITEMS.filter((item) => can(item.module, "view"));

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <span className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-500 text-white shadow-sm">
          <FileBarChart2 className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">{branding?.systemName ?? "Report Manager"}</p>
          <p className="truncate text-[11px] text-slate-400 dark:text-slate-500">{branding?.companyName || "Multi-project workspace"}</p>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 px-3">
        {visibleItems.map((item) => {
          const active = pathname === item.href || pathname?.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={[
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100",
              ].join(" ")}
            >
              <Icon className="size-[18px]" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-100 px-5 py-4 dark:border-slate-800">
        <p className="text-[11px] text-slate-400 dark:text-slate-500">v1.0.0</p>
      </div>
    </div>
  );
}
