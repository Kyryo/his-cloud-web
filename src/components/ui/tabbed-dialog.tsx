"use client";

import type { ReactNode } from "react";

import { SectionedDialog } from "@/components/ui/sectioned-dialog";
import { cn } from "@/lib/utils";

export type TabbedDialogTab = {
  id: string;
  label: string;
  disabled?: boolean;
  errorCount?: number;
};

type TabbedDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
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
  const tabNav =
    tabs.length > 1 ? (
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
              <span className="inline-flex items-center gap-1.5">
                {tab.label}
                {tab.errorCount && tab.errorCount > 0 ? (
                  <span
                    className="inline-flex min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold leading-4 text-white"
                    aria-label={`${tab.errorCount} validation ${tab.errorCount === 1 ? "error" : "errors"}`}
                  >
                    {tab.errorCount > 1 ? tab.errorCount : "●"}
                  </span>
                ) : null}
              </span>
            </button>
          );
        })}
      </nav>
    ) : null;

  return (
    <SectionedDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      footer={footer}
      headerExtra={tabNav}
      className={className}
      contentClassName={contentClassName}
      data-testid={dataTestId}
    >
      {children}
    </SectionedDialog>
  );
}
