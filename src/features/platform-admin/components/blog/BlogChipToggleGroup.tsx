import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

type ChipOption = { id: string; label: string };

type BlogChipToggleGroupProps = {
  options: ChipOption[];
  value: string[];
  onChange: (value: string[]) => void;
  emptyMessage: string;
  ariaLabel: string;
};

/** Multi-select as flat pills: lighter than a checkbox grid and scannable at a glance. */
export function BlogChipToggleGroup({ options, value, onChange, emptyMessage, ariaLabel }: BlogChipToggleGroupProps) {
  if (options.length === 0) {
    return <p className="text-xs text-dash-muted">{emptyMessage}</p>;
  }
  const selected = new Set(value);
  return (
    <div role="group" aria-label={ariaLabel} className="flex flex-wrap gap-1.5">
      {options.map((option) => {
        const active = selected.has(option.id);
        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(active ? value.filter((id) => id !== option.id) : [...value, option.id])}
            className={cn(
              "inline-flex h-7 items-center gap-1 rounded-full px-3 text-xs font-medium ring-1 ring-inset transition-colors",
              active
                ? "bg-brand-tint text-brand-primary ring-brand-primary/30"
                : "text-brand-slate ring-dash-border hover:bg-dash-canvas",
            )}
          >
            {active ? <Check className="size-3" aria-hidden="true" /> : null}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
