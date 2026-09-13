"use client";

import * as RadixAlertDialog from "@radix-ui/react-alert-dialog";
import { AlertTriangle } from "lucide-react";
import { Button } from "./Button";

interface AlertDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function AlertDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger,
  onConfirm,
  onCancel,
}: AlertDialogProps) {
  return (
    <RadixAlertDialog.Root open={open} onOpenChange={(next) => !next && onCancel()}>
      <RadixAlertDialog.Portal>
        <RadixAlertDialog.Overlay className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-[1px]" />
        <RadixAlertDialog.Content className="fixed left-1/2 top-1/2 z-[100] w-[calc(100vw-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-xl">
          <div className="flex gap-3">
            {danger && (
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
                <AlertTriangle className="size-5" />
              </span>
            )}
            <div>
              <RadixAlertDialog.Title className="text-base font-semibold text-slate-900">{title}</RadixAlertDialog.Title>
              {description && (
                <RadixAlertDialog.Description className="mt-1.5 text-sm text-slate-500">
                  {description}
                </RadixAlertDialog.Description>
              )}
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <RadixAlertDialog.Cancel asChild>
              <Button variant="secondary" onClick={onCancel}>
                {cancelLabel}
              </Button>
            </RadixAlertDialog.Cancel>
            <RadixAlertDialog.Action asChild>
              <Button variant={danger ? "danger-solid" : "primary"} onClick={onConfirm}>
                {confirmLabel}
              </Button>
            </RadixAlertDialog.Action>
          </div>
        </RadixAlertDialog.Content>
      </RadixAlertDialog.Portal>
    </RadixAlertDialog.Root>
  );
}
