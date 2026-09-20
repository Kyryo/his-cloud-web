"use client";

import { AppIcon, type AppIconName } from "@/components/icons/app-icon";
import { cn } from "@/lib/utils";

export type NextStepOption = {
  id: string;
  title: string;
  description: string;
  icon: AppIconName;
  emphasized?: boolean;
  disabled?: boolean;
  disabledReason?: string;
  onSelect: () => void;
  testId: string;
};

type NextStepOptionsListProps = {
  options: NextStepOption[];
  className?: string;
  testId?: string;
  /** Selected option id for radio-style highlighting. */
  selectedId?: string | null;
};

export function NextStepOptionsList({
  options,
  className,
  testId = "next-step-options",
  selectedId = null,
}: NextStepOptionsListProps) {
  return (
    <ul className={cn("divide-y divide-brand-border", className)} data-testid={testId}>
      {options.map((option) => {
        const isSelected = selectedId === option.id;
        const isDisabled = Boolean(option.disabled);

        return (
          <li key={option.id}>
            <button
              type="button"
              disabled={isDisabled}
              onClick={option.onSelect}
              aria-pressed={selectedId != null ? isSelected : undefined}
              className={cn(
                "flex w-full items-start gap-3 px-6 py-4 text-left transition-colors",
                isDisabled
                  ? "cursor-not-allowed bg-slate-50/80 opacity-60"
                  : isSelected
                    ? "bg-brand-tint/50 hover:bg-brand-tint/70"
                    : option.emphasized
                      ? "bg-brand-tint/40 hover:bg-brand-tint/70"
                      : "hover:bg-slate-50",
              )}
              data-testid={option.testId}
            >
              <span
                className={cn(
                  "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full border",
                  isDisabled
                    ? "border-brand-border bg-white text-brand-muted"
                    : isSelected || option.emphasized
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
                  {isDisabled && option.disabledReason
                    ? option.disabledReason
                    : option.description}
                </span>
              </span>
              {!isDisabled ? (
                <AppIcon
                  name="chevronRight"
                  size={16}
                  className="mt-2 shrink-0 text-brand-muted"
                />
              ) : null}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
