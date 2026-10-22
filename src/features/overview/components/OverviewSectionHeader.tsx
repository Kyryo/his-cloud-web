"use client";

import Link from "next/link";

import { cn } from "@/lib/utils";

type OverviewSectionHeaderProps = {
  title: string;
  titleId?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
};

export function OverviewSectionHeader({
  title,
  titleId,
  actionLabel,
  actionHref,
  onAction,
  className,
}: OverviewSectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 px-1",
        className,
      )}
    >
      <h2
        id={titleId}
        className="text-[15px] font-semibold tracking-tight text-brand-navy"
      >
        {title}
      </h2>
      {actionLabel && actionHref ? (
        <Link
          href={actionHref}
          className="text-[13px] font-medium text-dash-muted transition-colors hover:text-brand-primary"
        >
          {actionLabel}
        </Link>
      ) : null}
      {actionLabel && onAction && !actionHref ? (
        <button
          type="button"
          onClick={onAction}
          className="text-[13px] font-medium text-dash-muted transition-colors hover:text-brand-primary"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
