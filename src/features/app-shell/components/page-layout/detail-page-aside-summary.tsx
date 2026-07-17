import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type DetailPageAsidePanelHeaderProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export function DetailPageAsidePanelHeader({
  title,
  description,
  action,
}: DetailPageAsidePanelHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0">
        <h2 className="text-sm font-semibold text-brand-navy">{title}</h2>
        {description ? (
          <p className="mt-0.5 text-xs text-brand-muted">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

type DetailPageAsideSummaryFieldProps = {
  label: string;
  value: ReactNode;
  className?: string;
};

export function DetailPageAsideSummaryField({
  label,
  value,
  className,
}: DetailPageAsideSummaryFieldProps) {
  return (
    <div className={className}>
      <dt className="text-xs text-brand-muted">{label}</dt>
      <dd className="mt-0.5 break-words text-sm font-normal text-brand-slate">
        {value}
      </dd>
    </div>
  );
}

type DetailPageAsideSummarySectionProps = {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function DetailPageAsideSummarySection({
  title,
  action,
  children,
  className,
}: DetailPageAsideSummarySectionProps) {
  return (
    <div className={cn("border-t border-brand-border pt-4", className)}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-[11px] font-medium uppercase tracking-wide text-brand-muted">
          {title}
        </h3>
        {action}
      </div>
      <dl className="space-y-3">{children}</dl>
    </div>
  );
}

type DetailPageAsideSummaryAmountRowProps = {
  label: string;
  value: ReactNode;
  emphasized?: boolean;
  variant?: "default" | "danger";
};

export function DetailPageAsideSummaryAmountRow({
  label,
  value,
  emphasized = false,
  variant = "default",
}: DetailPageAsideSummaryAmountRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <dt className={emphasized ? "font-medium text-brand-navy" : "text-brand-muted"}>
        {label}
      </dt>
      <dd
        className={cn(
          emphasized
            ? "font-medium text-brand-navy"
            : "font-normal text-brand-slate",
          variant === "danger" && "font-medium text-red-600",
        )}
      >
        {value}
      </dd>
    </div>
  );
}

type DetailPageAsideSummaryHighlightProps = {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function DetailPageAsideSummaryHighlight({
  title,
  action,
  children,
  className,
}: DetailPageAsideSummaryHighlightProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-brand-border bg-slate-50/60 p-4",
        className,
      )}
    >
      {title || action ? (
        <div className="flex items-center justify-between gap-2">
          {title ? (
            <h3 className="text-[11px] font-medium uppercase tracking-wide text-brand-muted">
              {title}
            </h3>
          ) : (
            <span />
          )}
          {action}
        </div>
      ) : null}
      <div className={title || action ? "mt-3" : undefined}>{children}</div>
    </div>
  );
}
