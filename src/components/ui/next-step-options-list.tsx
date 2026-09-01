"use client";

import { AppIcon, type AppIconName } from "@/components/icons/app-icon";
import { cn } from "@/lib/utils";

export type NextStepOption = {
  id: string;
  title: string;
  description: string;
  icon: AppIconName;
  emphasized?: boolean;
  onSelect: () => void;
  testId: string;
};

type NextStepOptionsListProps = {
  options: NextStepOption[];
  className?: string;
  testId?: string;
};

export function NextStepOptionsList({
  options,
  className,
  testId = "next-step-options",
}: NextStepOptionsListProps) {
  return (
    <ul className={cn("divide-y divide-brand-border", className)} data-testid={testId}>
      {options.map((option) => (
        <li key={option.id}>
          <button
            type="button"
            onClick={option.onSelect}
            className={cn(
              "flex w-full items-start gap-3 px-6 py-4 text-left transition-colors hover:bg-slate-50",
              option.emphasized && "bg-brand-tint/40 hover:bg-brand-tint/70",
            )}
            data-testid={option.testId}
          >
            <span
              className={cn(
                "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full border",
                option.emphasized
                  ? "border-brand-primary/20 bg-white text-brand-primary"
                  : "border-brand-border bg-slate-50 text-brand-navy",
              )}
            >
              <AppIcon name={option.icon} size={16} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium text-brand-navy">
                {option.title}
              </span>
              <span className="mt-0.5 block text-sm text-brand-muted">
                {option.description}
              </span>
            </span>
            <AppIcon
              name="chevronRight"
              size={16}
              className="mt-2 shrink-0 text-brand-muted"
            />
          </button>
        </li>
      ))}
    </ul>
  );
}
