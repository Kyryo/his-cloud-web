"use client";

import type { ReactNode } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type SectionedDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  headerExtra?: ReactNode;
  className?: string;
  contentClassName?: string;
  "data-testid"?: string;
};

export function SectionedDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  headerExtra,
  className,
  contentClassName,
  "data-testid": dataTestId,
}: SectionedDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl",
          className,
        )}
        data-testid={dataTestId}
      >
        <div
          className={cn(
            "border-b border-brand-border px-6 pt-6",
            headerExtra ? "pb-0" : "pb-4",
          )}
        >
          <DialogHeader className="pr-8">
            <DialogTitle>{title}</DialogTitle>
            {description ? (
              <DialogDescription>{description}</DialogDescription>
            ) : null}
          </DialogHeader>
          {headerExtra}
        </div>

        <div
          className={cn(
            "min-h-0 flex-1 overflow-y-auto px-6 py-6",
            contentClassName,
          )}
        >
          {children}
        </div>

        {footer ? (
          <DialogFooter className="mt-0 border-t border-brand-border px-6 py-4">
            {footer}
          </DialogFooter>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
