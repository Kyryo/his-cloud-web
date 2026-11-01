"use client";

import { CircleDot, ListChecks } from "lucide-react";

import type { OhCatalogSelectionMode } from "@/features/occupational-health/types";
import { cn } from "@/lib/utils";

const OPTIONS: Array<{
  id: OhCatalogSelectionMode;
  label: string;
  hint: string;
  icon: typeof CircleDot;
}> = [
  { id: "exclusive", label: "Pick one", hint: "Single choice", icon: CircleDot },
  { id: "inclusive", label: "Pick any", hint: "Multiple choice", icon: ListChecks },
];

type SelectionModeToggleProps = {
  value: OhCatalogSelectionMode;
  onChange: (value: OhCatalogSelectionMode) => void;
  disabled?: boolean;
};

export function SelectionModeToggle({
  value,
  onChange,
  disabled = false,
}: SelectionModeToggleProps) {
  return (
    <div
      role="radiogroup"
      aria-label="How staff select items"
      className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1"
    >
      {OPTIONS.map((option) => {
        const selected = value === option.id;
        const Icon = option.icon;
        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => onChange(option.id)}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-left transition-[background-color,box-shadow,color] duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/30",
              selected
                ? "bg-white text-brand-navy shadow-[0_1px_2px_rgb(15_23_42/0.08)]"
                : "text-brand-muted hover:text-brand-navy",
            )}
          >
            <Icon
              className={cn("size-4 shrink-0", selected && "text-brand-primary")}
              aria-hidden
            />
            <span className="min-w-0">
              <span className="block text-sm font-medium leading-5">
                {option.label}
              </span>
              <span className="block text-xs text-dash-muted">{option.hint}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
