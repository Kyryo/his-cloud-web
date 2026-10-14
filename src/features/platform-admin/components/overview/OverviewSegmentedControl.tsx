"use client";

import { motion } from "framer-motion";
import { useId } from "react";

import { cn } from "@/lib/utils";

type Option<T extends string | number> = { value: T; label: string };

type Props<T extends string | number> = {
  label: string;
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
};

export function OverviewSegmentedControl<T extends string | number>({
  label,
  options,
  value,
  onChange,
}: Props<T>) {
  const id = useId();
  return (
    <div
      role="tablist"
      aria-label={label}
      className="relative inline-flex items-center gap-0.5 rounded-lg bg-foreground/[0.04] p-0.5 text-xs ring-1 ring-inset ring-foreground/[0.06]"
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={String(option.value)}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              "relative rounded-md px-2.5 py-1 font-medium tabular-nums transition-colors",
              selected
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {selected ? (
              <motion.span
                layoutId={`seg-${id}`}
                className="absolute inset-0 rounded-md bg-background shadow-[0_1px_2px_rgba(0,0,0,0.08)] ring-1 ring-foreground/[0.06]"
                transition={{ type: "spring", stiffness: 500, damping: 38 }}
              />
            ) : null}
            <span className="relative">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
