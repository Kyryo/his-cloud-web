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
        "px-4",
        compact ? "py-2" : "py-2.5",
        onRowClick && "cursor-pointer hover:bg-slate-50/80",
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
      <div className={cn("flex gap-2.5", !Icon && "gap-0")}>
        {Icon ? (
          <div className="flex size-7 shrink-0 items-center justify-center rounded-full border border-brand-border bg-slate-50 text-brand-primary">
            <Icon className="size-3" aria-hidden="true" />
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
            <div className="flex shrink-0 items-start gap-1">
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
              <RecordCreatedByMeta
                dateTime={dateTime}
                createdByName={createdByName}
                createdByEmail={createdByEmail}
              />
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
  title: string;
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
      className={cn("rounded-xl border border-brand-border bg-white", className)}
      data-testid={testId}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-brand-border px-4 py-2.5">
        <div>
          <h3 className="text-sm font-semibold text-brand-navy">{title}</h3>
          {description ? (
            <p className="mt-0.5 text-xs text-brand-muted">{description}</p>
          ) : null}
        </div>
        {action}
      </div>
      <ol className="divide-y divide-brand-border">{children}</ol>
      {footer ? <div className="border-t border-brand-border px-4 py-2.5">{footer}</div> : null}
    </section>
  );
}
