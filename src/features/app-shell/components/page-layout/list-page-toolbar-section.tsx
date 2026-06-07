import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type ListPageToolbarSectionProps = {
  children: ReactNode;
  className?: string;
};

export function ListPageToolbarSection({
  children,
  className,
}: ListPageToolbarSectionProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between",
        className,
      )}
    >
      {children}
    </div>
  );
}

type ListPageToolbarSearchProps = {
  children: ReactNode;
  className?: string;
};

export function ListPageToolbarSearch({
  children,
  className,
}: ListPageToolbarSearchProps) {
  return (
    <div
      className={cn(
        "hidden flex-1 flex-col gap-2 sm:flex sm:flex-row sm:items-center",
        className,
      )}
    >
      {children}
    </div>
  );
}

type ListPageToolbarActionsProps = {
  children: ReactNode;
  className?: string;
};

export function ListPageToolbarActions({
  children,
  className,
}: ListPageToolbarActionsProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {children}
    </div>
  );
}

type ListPageToolbarFiltersProps = {
  children: ReactNode;
  className?: string;
};

export function ListPageToolbarFilters({
  children,
  className,
}: ListPageToolbarFiltersProps) {
  return <div className={className}>{children}</div>;
}
