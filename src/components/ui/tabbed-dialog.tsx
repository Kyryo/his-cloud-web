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

export type TabbedDialogTab = {
  id: string;
  label: string;
  disabled?: boolean;
};

type TabbedDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  tabs: TabbedDialogTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  contentClassName?: string;
  "data-testid"?: string;
};

export function TabbedDialog({
  open,
  onOpenChange,
  title,
  description,
  tabs,
  activeTab,
  onTabChange,
  children,
  footer,
  className,
  contentClassName,
  "data-testid": dataTestId,
}: TabbedDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl",
          className,
        )}
        data-testid={dataTestId}
      >
        <div className="border-b border-brand-border px-6 pb-0 pt-6">
          <DialogHeader className="pr-8">
            <DialogTitle>{title}</DialogTitle>
            {description ? (
              <DialogDescription>{description}</DialogDescription>
            ) : null}
          </DialogHeader>

          {tabs.length > 1 ? (
            <nav
              className="scrollbar-hide mt-5 flex gap-1 overflow-x-auto"
              aria-label="Dialog sections"
            >
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    disabled={tab.disabled}
                    aria-current={isActive ? "page" : undefined}
                    onClick={() => {
                      if (!tab.disabled) {
                        onTabChange(tab.id);
                      }
                    }}
                    className={cn(
                      "whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition-colors",
                      isActive
                        ? "border-brand-primary text-brand-primary"
                        : "border-transparent text-brand-muted hover:border-brand-border hover:text-brand-navy",
                      tab.disabled &&
                        "cursor-not-allowed opacity-40 hover:border-transparent hover:text-brand-muted",
                    )}
                    data-testid={`tabbed-dialog-tab-${tab.id}`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          ) : null}
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
