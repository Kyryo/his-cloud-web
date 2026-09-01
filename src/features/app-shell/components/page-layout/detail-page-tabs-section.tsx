import type { ReactNode } from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";

type DetailPageTabsSectionProps = {
  children: ReactNode;
  className?: string;
  "data-testid"?: string;
};

export function DetailPageTabsSection({
  children,
  className,
  "data-testid": dataTestId,
}: DetailPageTabsSectionProps) {
  return (
    <div
      className={cn("flex flex-1 flex-col bg-white", className)}
      data-testid={dataTestId}
    >
      {children}
    </div>
  );
}

type DetailPageTabsNavSectionProps = {
  children: ReactNode;
  "aria-label": string;
  className?: string;
};

export function DetailPageTabsNavSection({
  children,
  "aria-label": ariaLabel,
  className,
}: DetailPageTabsNavSectionProps) {
  return (
    <div className={cn("border-b border-dash-border/80 bg-white", className)}>
      <nav
        className="scrollbar-hide flex gap-1 overflow-x-auto px-4 sm:px-6"
        aria-label={ariaLabel}
      >
        {children}
      </nav>
    </div>
  );
}

type DetailPageTabNavItemProps = {
  children: ReactNode;
  isActive: boolean;
  href?: string;
  onClick?: () => void;
  className?: string;
};

const TAB_NAV_ITEM_CLASS =
  "whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition-colors";

export function DetailPageTabNavItem({
  children,
  isActive,
  href,
  onClick,
  className,
}: DetailPageTabNavItemProps) {
  const itemClassName = cn(
    TAB_NAV_ITEM_CLASS,
    isActive
      ? "border-brand-primary text-brand-primary"
      : "border-transparent text-brand-muted hover:border-brand-border hover:text-brand-navy",
    className,
  );

  if (href) {
    return (
      <Link
        href={href}
        className={itemClassName}
        aria-current={isActive ? "page" : undefined}
        onClick={onClick}
      >
        {children}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={itemClassName}>
      {children}
    </button>
  );
}

type DetailPageMainAsideGridProps = {
  children: ReactNode;
  className?: string;
};

export function DetailPageMainAsideGrid({
  children,
  className,
}: DetailPageMainAsideGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_23rem]",
        className,
      )}
    >
      {children}
    </div>
  );
}

type DetailPageMainSectionProps = {
  children: ReactNode;
  className?: string;
};

export function DetailPageMainSection({
  children,
  className,
}: DetailPageMainSectionProps) {
  return (
    <main className={cn("px-4 py-4 sm:px-6", className)}>{children}</main>
  );
}
