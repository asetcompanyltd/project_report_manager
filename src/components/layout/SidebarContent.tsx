"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileBarChart2 } from "lucide-react";

const NAV_ITEMS = [{ label: "Dashboard", href: "/projects", icon: LayoutDashboard }];

export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <span className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-500 text-white shadow-sm">
          <FileBarChart2 className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-slate-900">Report Manager</p>
          <p className="text-[11px] text-slate-400">Multi-project workspace</p>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 px-3">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname?.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={[
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
              ].join(" ")}
            >
              <Icon className="size-[18px]" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-100 px-5 py-4">
        <p className="text-[11px] text-slate-400">v1.0.0</p>
      </div>
    </div>
  );
}
