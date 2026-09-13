"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ReactNode } from "react";

interface ModalProps {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  footer: ReactNode;
  size?: "sm" | "md" | "lg";
}

const SIZE_CLASS = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-2xl",
};

export function Modal({ open, title, description, onClose, children, footer, size = "sm" }: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(next) => !next && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-[1px]" />
        <Dialog.Content
          className={[
            "fixed left-1/2 top-1/2 z-[100] w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-xl dark:bg-slate-800",
            "max-h-[calc(100vh-2rem)] overflow-y-auto",
            SIZE_CLASS[size],
          ].join(" ")}
        >
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</Dialog.Title>
              {description && <Dialog.Description className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</Dialog.Description>}
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Close"
                className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
              >
                <X className="size-4" />
              </button>
            </Dialog.Close>
          </div>
          {!description && (
            <Dialog.Description className="sr-only">{title}</Dialog.Description>
          )}
          {children}
          <div className="mt-6 flex justify-end gap-2">{footer}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
