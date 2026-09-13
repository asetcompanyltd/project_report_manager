"use client";

import { Menu } from "lucide-react";
import { ProjectSelector } from "@/components/project/ProjectSelector";
import { UserMenu } from "./UserMenu";

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6">
      <button
        onClick={onMenuClick}
        aria-label="Open menu"
        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
      >
        <Menu className="size-5" />
      </button>
      <ProjectSelector />
      <div className="flex-1" />
      <UserMenu />
    </header>
  );
}
