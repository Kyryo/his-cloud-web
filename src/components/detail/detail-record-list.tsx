"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import type { DetailRecordRowMenuAction } from "@/components/detail/detail-record-row-menu";
import { DetailRecordRowMenu } from "@/components/detail/detail-record-row-menu";
import { SecondaryButton } from "@/components/ui/app-buttons";
import { RecordCreatedByMeta } from "@/components/detail/record-created-by-meta";
import { cn } from "@/lib/utils";

type DetailRecordListItemProps = {
  icon?: LucideIcon;
  title: string;
  description?: ReactNode;
  badges?: ReactNode;
  dateTime: string;
  createdByName?: string | null;
  createdByEmail?: string | null;
  onUpdate?: () => void;
  updateLabel?: string;
  menuActions?: DetailRecordRowMenuAction[];
  onRowClick?: () => void;
  compact?: boolean;
  "data-testid"?: string;
};

export function DetailRecordListItem({
  icon: Icon,
  title,
  description,
  badges,
  dateTime,
  createdByName,
  createdByEmail,
  onUpdate,
  updateLabel = "Update",
  menuActions,
  onRowClick,
  compact = false,
  "data-testid": testId,
}: DetailRecordListItemProps) {
  return (
    <li
      className={cn(
        "px-4 sm:px-5",
        compact ? "py-2.5" : "py-3",
        onRowClick && "cursor-pointer transition-colors hover:bg-slate-50/70 active:bg-slate-100/60",
      )}
      data-testid={testId}
      onClick={onRowClick}
      onKeyDown={
        onRowClick
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onRowClick();
              }
            }
          : undefined
      }
      role={onRowClick ? "button" : undefined}
      tabIndex={onRowClick ? 0 : undefined}
    >
      <div className={cn("flex gap-3", !Icon && "gap-0")}>
        {Icon ? (
          <div className="flex size-7.5 shrink-0 items-center justify-center rounded-lg border border-slate-200/80 bg-slate-50 text-brand-primary shadow-2xs">
            <Icon className="size-3.5" aria-hidden="true" />
          </div>
        ) : null}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <p
                  className={cn(
                    "font-medium leading-tight text-brand-navy",
                    compact ? "text-sm" : "text-sm",
                  )}
                >
                  {title}
                </p>
                {badges ? (
                  <div className="flex flex-wrap items-center gap-1.5">{badges}</div>
                ) : null}
              </div>
              {description ? (
                <div
                  className={cn(
                    "space-y-0.5 leading-snug text-brand-slate",
                    compact ? "text-xs" : "text-xs",
                  )}
                >
                  {description}
                </div>
              ) : null}
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <RecordCreatedByMeta
                dateTime={dateTime}
                createdByName={createdByName}
                createdByEmail={createdByEmail}
              />
              {onUpdate && !menuActions?.length ? (
                <SecondaryButton
                  type="button"
                  size="sm"
                  className="h-7 rounded-full px-2.5 text-xs"
                  onClick={(event) => {
                    event.stopPropagation();
                    onUpdate();
                  }}
                >
                  {updateLabel}
                </SecondaryButton>
              ) : null}
              {menuActions?.length ? (
                <div onClick={(event) => event.stopPropagation()}>
                  <DetailRecordRowMenu actions={menuActions} />
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}

type DetailRecordListProps = {
  title: ReactNode;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  "data-testid"?: string;
};

export function DetailRecordList({
  title,
  description,
  action,
  children,
  footer,
  className,
  "data-testid": testId,
}: DetailRecordListProps) {
  return (
    <section
      className={cn("rounded-xl border border-dash-border/80 bg-white", className)}
      data-testid={testId}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-dash-border/80 px-4 py-3 sm:px-5">
        <div>
          <h3 className="text-sm font-semibold text-brand-navy">{title}</h3>
          {description ? (
            <p className="mt-0.5 text-xs text-brand-muted">{description}</p>
          ) : null}
        </div>
        {action}
      </div>
      <ol className="divide-y divide-dash-border/60">{children}</ol>
      {footer ? (
        <div className="border-t border-dash-border/80 px-4 py-2.5 sm:px-5">
          {footer}
        </div>
      ) : null}
    </section>
  );
}
