"use client";

import { CircleDot, FormInput, ListChecks } from "lucide-react";

import type { OhLibraryContentMode } from "@/features/occupational-health/types";
import type { OhCatalogSelectionMode } from "@/features/occupational-health/types";
import { cn } from "@/lib/utils";

export type SectionInteractionMode = "exclusive" | "inclusive" | "direct";

const OPTIONS: Array<{
  id: SectionInteractionMode;
  label: string;
  hint: string;
  icon: typeof CircleDot;
}> = [
  {
    id: "exclusive",
    label: "Pick one",
    hint: "Staff choose exactly one item from the list you set up",
    icon: CircleDot,
  },
  {
    id: "inclusive",
    label: "Pick any",
    hint: "Staff choose zero or more items from the list you set up",
    icon: ListChecks,
  },
  {
    id: "direct",
    label: "Enter values",
    hint: "No items — staff fill one or more fields you define on the section",
    icon: FormInput,
  },
];

export function interactionFromSection(input: {
  contentMode: OhLibraryContentMode;
  selectionMode: OhCatalogSelectionMode;
}): SectionInteractionMode {
  if (input.contentMode === "direct") {
    return "direct";
  }
  return input.selectionMode === "exclusive" ? "exclusive" : "inclusive";
}

export function sectionModesFromInteraction(mode: SectionInteractionMode): {
  contentMode: OhLibraryContentMode;
  selectionMode: OhCatalogSelectionMode;
} {
  if (mode === "direct") {
    return { contentMode: "direct", selectionMode: "inclusive" };
  }
  return {
    contentMode: "items",
    selectionMode: mode === "exclusive" ? "exclusive" : "inclusive",
  };
}

type SelectionModeToggleProps = {
  value: SectionInteractionMode;
  onChange: (value: SectionInteractionMode) => void;
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
      aria-label="How staff choose"
      className="grid gap-1 rounded-xl bg-slate-100 p-1"
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
              "flex items-start gap-2 rounded-lg px-3 py-2.5 text-left transition-[background-color,box-shadow,color] duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/30",
              selected
                ? "bg-white text-brand-navy shadow-[0_1px_2px_rgb(15_23_42/0.08)]"
                : "text-brand-muted hover:text-brand-navy",
            )}
          >
            <Icon
              className={cn("mt-0.5 size-4 shrink-0", selected && "text-brand-primary")}
              aria-hidden
            />
            <span className="min-w-0">
              <span className="block text-sm font-medium leading-5">{option.label}</span>
              <span className="block text-xs leading-4 text-dash-muted">{option.hint}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
