import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type StartVisitChoiceRowProps = {
  selected: boolean;
  title: string;
  hint?: string;
  trailing?: ReactNode;
  onSelect: () => void;
  disabled?: boolean;
};

export function StartVisitChoiceRow({
  selected,
  title,
  hint,
  trailing,
  onSelect,
  disabled = false,
}: StartVisitChoiceRowProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        "flex w-full items-center gap-3 py-3 text-left transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/20",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border",
          selected
            ? "border-brand-primary bg-brand-primary"
            : "border-dash-border bg-white",
        )}
        aria-hidden="true"
      >
        {selected ? <span className="size-1.5 rounded-full bg-white" /> : null}
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={cn(
            "block text-sm",
            selected ? "font-medium text-brand-navy" : "text-brand-navy",
          )}
        >
          {title}
        </span>
        {hint ? (
          <span className="mt-0.5 block text-xs text-dash-muted">{hint}</span>
        ) : null}
      </span>
      {trailing ? (
        <span className="shrink-0 text-xs text-dash-muted">{trailing}</span>
      ) : null}
    </button>
  );
}
