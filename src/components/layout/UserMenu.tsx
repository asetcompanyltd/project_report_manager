"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { LogOut, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function UserMenu() {
  const { user, logout } = useAuth();
  const router = useRouter();

  if (!user) return null;

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="flex items-center gap-2 rounded-lg py-1 pl-1 pr-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800">
          <span className="flex size-8 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white">
            {initials(user.name)}
          </span>
          <span className="hidden max-w-32 truncate font-medium text-slate-700 sm:inline dark:text-slate-200">{user.name}</span>
          <ChevronDown className="hidden size-4 text-slate-400 sm:inline" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-[100] w-56 rounded-lg border border-slate-200 bg-white p-1.5 shadow-lg dark:border-slate-700 dark:bg-slate-800"
        >
          <div className="px-2.5 py-2">
            <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{user.name}</p>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
            {user.roleName && (
              <span className="mt-1.5 inline-block rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">
                {user.roleName}
              </span>
            )}
          </div>
          <DropdownMenu.Separator className="my-1 h-px bg-slate-100 dark:bg-slate-700" />
          <DropdownMenu.Item
            onSelect={handleLogout}
            className="flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-sm text-slate-600 outline-none hover:bg-slate-100 data-[highlighted]:bg-slate-100 dark:text-slate-300 dark:data-[highlighted]:bg-slate-700"
          >
            <LogOut className="size-4" />
            Log out
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
