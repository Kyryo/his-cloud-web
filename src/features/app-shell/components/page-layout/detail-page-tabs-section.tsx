import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type DetailPageTabsSectionProps = {
  children: ReactNode;
  className?: string;
};

export function DetailPageTabsSection({
  children,
  className,
}: DetailPageTabsSectionProps) {
  return (
    <div className={cn("flex flex-1 flex-col bg-[#fafbfc]", className)}>
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
    <div className={cn("border-b border-brand-border bg-white", className)}>
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
  onClick: () => void;
  className?: string;
};

export function DetailPageTabNavItem({
  children,
  isActive,
  onClick,
  className,
}: DetailPageTabNavItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition-colors",
        isActive
          ? "border-brand-primary text-brand-primary"
          : "border-transparent text-brand-muted hover:border-brand-border hover:text-brand-navy",
        className,
      )}
    >
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
