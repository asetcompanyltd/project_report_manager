"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { SidebarContent } from "./SidebarContent";

export function MobileSidebar({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-slate-900/50 lg:hidden" />
        <Dialog.Content className="fixed inset-y-0 left-0 z-[100] w-72 max-w-[85vw] bg-white shadow-xl lg:hidden dark:bg-slate-900">
          <Dialog.Title className="sr-only">Navigation</Dialog.Title>
          <Dialog.Close asChild>
            <button
              aria-label="Close menu"
              className="absolute right-3 top-3 rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
            >
              <X className="size-5" />
            </button>
          </Dialog.Close>
          <SidebarContent onNavigate={() => onOpenChange(false)} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
