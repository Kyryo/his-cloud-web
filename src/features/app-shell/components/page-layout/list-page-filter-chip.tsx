import type { ReactNode } from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

type ListPageFilterChipProps = {
  label: string;
  onRemove: () => void;
  disabled?: boolean;
  className?: string;
};

export function ListPageFilterChip({
  label,
  onRemove,
  disabled = false,
  className,
}: ListPageFilterChipProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onRemove}
      aria-label={`Remove ${label}`}
      className={cn(
        "inline-flex h-7 items-center gap-1.5 rounded-md border border-dash-border bg-white px-2 text-xs text-brand-navy",
        "transition-[background-color,border-color,transform] hover:bg-dash-canvas",
        "active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
    >
      <span>{label}</span>
      <X className="size-3 text-dash-muted" aria-hidden="true" />
    </button>
  );
}

type ListPageActiveFiltersProps = {
  children: ReactNode;
  onClearAll: () => void;
  disabled?: boolean;
  className?: string;
};

export function ListPageActiveFilters({
  children,
  onClearAll,
  disabled = false,
  className,
}: ListPageActiveFiltersProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-1.5 pt-0.5", className)}>
      <span className="mr-0.5 text-xs text-dash-muted">Active filters:</span>
      {children}
      <button
        type="button"
        disabled={disabled}
        onClick={onClearAll}
        className="ml-0.5 h-7 px-1.5 text-xs text-dash-muted transition-colors hover:text-brand-navy disabled:pointer-events-none disabled:opacity-50"
      >
        Clear all
      </button>
    </div>
  );
}
