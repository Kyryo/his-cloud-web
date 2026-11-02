"use client";

import type { OhLibraryContentMode } from "@/features/occupational-health/types";
import { cn } from "@/lib/utils";

type ContentModeToggleProps = {
  value: OhLibraryContentMode;
  onChange: (mode: OhLibraryContentMode) => void;
  disabled?: boolean;
};

const MODES: Array<{
  id: OhLibraryContentMode;
  label: string;
  description: string;
}> = [
  {
    id: "items",
    label: "Items",
    description: "Section contains checklist items clinicians complete one by one.",
  },
  {
    id: "direct",
    label: "Direct response",
    description: "Section captures one response without child items.",
  },
];

export function ContentModeToggle({ value, onChange, disabled }: ContentModeToggleProps) {
  return (
    <div role="radiogroup" aria-label="Section content mode" className="grid gap-2">
      {MODES.map((mode) => {
        const selected = value === mode.id;
        return (
          <button
            key={mode.id}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => onChange(mode.id)}
            className={cn(
              "rounded-xl border px-4 py-3 text-left transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/30",
              selected
                ? "border-brand-primary/40 bg-brand-tint/40"
                : "border-dash-border hover:border-slate-300",
              disabled && "cursor-not-allowed opacity-60",
            )}
          >
            <p className="text-sm font-medium text-brand-navy">{mode.label}</p>
            <p className="mt-0.5 text-xs leading-5 text-dash-muted">{mode.description}</p>
          </button>
        );
      })}
    </div>
  );
}
