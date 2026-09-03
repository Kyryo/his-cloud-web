"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type FeedDateSeparatorProps = {
  label: string;
  headingId?: string;
  /** Matches Notifications inbox: false = centered pill, true = left pill + rule. */
  compact?: boolean;
  "data-testid"?: string;
};

/**
 * Date group separator used by Notifications and Activity feeds.
 * Styles must stay identical so both features share one visual system.
 */
export function FeedDateSeparator({
  label,
  headingId,
  compact = false,
  "data-testid": testId = "feed-date-group",
}: FeedDateSeparatorProps) {
  const id =
    headingId ?? `feed-group-${label.toLowerCase().replace(/\s+/g, "-")}`;

  if (compact) {
    return (
      <div
        className="mb-1 flex items-center gap-2"
        data-testid={testId}
        data-group={label}
      >
        <h2
          id={id}
          className="inline-flex shrink-0 items-center rounded-full bg-slate-100/90 px-2 py-0.5 text-[11px] font-semibold tracking-tight text-brand-slate"
        >
          {label}
        </h2>
        <div className="h-px min-w-3 flex-1 bg-dash-border" aria-hidden="true" />
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-3"
      data-testid={testId}
      data-group={label}
    >
      <div className="h-px flex-1 bg-dash-border" />
      <h2
        id={id}
        className="rounded-full border border-dash-border bg-white px-2.5 py-0.5 text-xs font-medium text-dash-muted"
      >
        {label}
      </h2>
      <div className="h-px flex-1 bg-dash-border" />
    </div>
  );
}

export type FeedItemProps = {
  title: string;
  description?: string | null;
  /** Tertiary line (module label, actor, etc.). */
  meta?: string | null;
  occurredAt: string;
  relativeTime: string;
  icon: ReactNode;
  showConnector?: boolean;
  compact?: boolean;
  /** Emphasized row (e.g. unread notifications). */
  emphasized?: boolean;
  showEmphasisDot?: boolean;
  emphasisDotTestId?: string;
  onClick?: () => void;
  "aria-label"?: string;
  "data-testid"?: string;
  "data-read"?: string;
  "data-href"?: string;
  className?: string;
  children?: ReactNode;
};

/**
 * Timeline row matching the Notifications inbox item layout exactly.
 */
export function FeedItem({
  title,
  description,
  meta,
  occurredAt,
  relativeTime,
  icon,
  showConnector = false,
  compact = false,
  emphasized = false,
  showEmphasisDot = false,
  emphasisDotTestId = "feed-item-emphasis-dot",
  onClick,
  "aria-label": ariaLabel,
  "data-testid": testId,
  "data-read": dataRead,
  "data-href": dataHref,
  className,
  children,
}: FeedItemProps) {
  const content = (
    <>
      <span
        className={cn(
          "relative flex shrink-0 flex-col items-center self-stretch",
          compact ? "w-7" : "w-8",
        )}
      >
        <span
          className={cn(
            "relative z-10 flex items-center justify-center",
            compact
              ? "size-[22px] rounded-[6px] border"
              : "size-8 rounded-full",
            compact
              ? emphasized
                ? "border-brand-primary/20 bg-brand-tint text-brand-primary"
                : "border-dash-border bg-white text-brand-muted"
              : "bg-brand-tint text-brand-primary",
          )}
        >
          {icon}
          {showEmphasisDot ? (
            <span
              className={cn(
                "absolute rounded-full bg-brand-primary ring-2 ring-white",
                compact
                  ? "-right-0.5 -top-0.5 size-1.5"
                  : "-right-0.5 -top-0.5 size-2",
              )}
              aria-hidden="true"
              data-testid={emphasisDotTestId}
            />
          ) : null}
        </span>
        {showConnector ? (
          <span className="mt-1 w-px flex-1 bg-dash-border" aria-hidden="true" />
        ) : null}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-start justify-between gap-3">
          <span
            className={cn(
              "min-w-0 leading-5 text-brand-navy",
              compact ? "text-[13px]" : "text-sm",
              emphasized
                ? "font-semibold"
                : compact
                  ? "font-medium"
                  : "font-medium text-brand-navy/90",
            )}
          >
            {title}
          </span>
          <time
            dateTime={occurredAt}
            className="shrink-0 pt-0.5 text-[11px] tabular-nums text-brand-muted"
          >
            {relativeTime}
          </time>
        </span>
        {description ? (
          <span
            className={cn(
              "mt-0.5 block text-brand-muted",
              compact
                ? "line-clamp-2 text-xs leading-4"
                : "text-sm leading-5",
            )}
          >
            {description}
          </span>
        ) : null}
        {meta ? (
          <span
            className={cn(
              "mt-0.5 block text-dash-muted",
              compact ? "text-[11px]" : "text-xs",
            )}
          >
            {meta}
          </span>
        ) : null}
        {children}
      </span>
    </>
  );

  const rowClassName = cn(
    "relative flex w-full gap-2.5 text-left transition-colors duration-150 sm:gap-3",
    compact
      ? "rounded-lg px-1 py-1.5 sm:px-1.5 hover:bg-slate-50/90"
      : "rounded-xl px-2 py-2.5 sm:px-3 hover:bg-dash-canvas",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/25",
    emphasized &&
      (compact
        ? "bg-brand-tint/40 hover:bg-brand-tint/65"
        : "bg-brand-tint/45 hover:bg-brand-tint/70"),
    className,
  );

  if (onClick) {
    return (
      <button
        type="button"
        className={rowClassName}
        onClick={onClick}
        data-testid={testId}
        data-read={dataRead}
        data-href={dataHref}
        aria-label={ariaLabel ?? title}
      >
        {content}
      </button>
    );
  }

  return (
    <div
      className={rowClassName}
      data-testid={testId}
      data-read={dataRead}
      data-href={dataHref}
      aria-label={ariaLabel}
    >
      {content}
    </div>
  );
}

export type FeedListProps = {
  children: ReactNode;
  compact?: boolean;
  className?: string;
  "data-testid"?: string;
};

export function FeedList({
  children,
  compact = false,
  className,
  "data-testid": testId,
}: FeedListProps) {
  return (
    <div
      className={cn(compact ? "space-y-3.5" : "space-y-5", className)}
      data-testid={testId}
      data-compact={compact ? "true" : "false"}
    >
      {children}
    </div>
  );
}

export type FeedGroupProps = {
  label: string;
  compact?: boolean;
  children: ReactNode;
  dateTestId?: string;
};

export function FeedGroup({
  label,
  compact = false,
  children,
  dateTestId,
}: FeedGroupProps) {
  const headingId = `feed-group-${label.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <section aria-labelledby={headingId}>
      <FeedDateSeparator
        label={label}
        headingId={headingId}
        compact={compact}
        data-testid={dateTestId}
      />
      <ol className={compact ? "mt-0.5" : "mt-1"}>{children}</ol>
    </section>
  );
}
