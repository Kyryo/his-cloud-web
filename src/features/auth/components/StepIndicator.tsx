import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

type Step = {
  number: number;
  label: string;
};

type StepIndicatorProps = {
  currentStep: number;
  steps: Step[];
  orientation?: "horizontal" | "vertical";
  /** Slim progress for the signup form card header. */
  compact?: boolean;
};

export function StepIndicator({
  currentStep,
  steps,
  orientation = "horizontal",
  compact = false,
}: StepIndicatorProps) {
  if (orientation === "vertical") {
    return (
      <ol className="space-y-4">
        {steps.map((step) => {
          const isActive = step.number === currentStep;
          const isComplete = step.number < currentStep;

          return (
            <li key={step.number} className="flex items-start gap-3">
              <span
                className={cn(
                  "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                  isComplete && "border-emerald-500 bg-emerald-500 text-white",
                  isActive && "border-brand-primary bg-brand-primary text-white",
                  !isActive &&
                    !isComplete &&
                    "border-brand-border bg-white text-brand-muted",
                )}
              >
                {isComplete ? <Check className="size-3.5" strokeWidth={2.5} /> : step.number}
              </span>
              <div className="min-w-0 pt-0.5">
                <p
                  className={cn(
                    "text-sm font-medium",
                    isActive || isComplete ? "text-brand-navy" : "text-brand-muted",
                  )}
                >
                  {step.label}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    );
  }

  if (compact) {
    return (
      <ol
        className="flex w-full items-center gap-1.5"
        aria-label={`Step ${currentStep} of ${steps.length}`}
      >
        {steps.map((step, index) => {
          const isActive = step.number === currentStep;
          const isComplete = step.number < currentStep;

          return (
            <li key={step.number} className="flex min-w-0 flex-1 items-center gap-1.5">
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <span
                  className={cn(
                    "h-1 w-full rounded-full transition-colors duration-300",
                    isComplete && "bg-emerald-500",
                    isActive && "bg-brand-primary",
                    !isActive && !isComplete && "bg-brand-border",
                  )}
                />
                <span
                  className={cn(
                    "truncate text-[11px] font-medium",
                    isActive && "text-brand-navy",
                    isComplete && "text-emerald-700",
                    !isActive && !isComplete && "text-brand-muted",
                  )}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 ? (
                <span className="sr-only">
                  {isComplete ? "completed" : isActive ? "current" : "upcoming"}
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
    );
  }

  return (
    <div className="flex flex-row items-center gap-2">
      {steps.map((step) => {
        const isActive = step.number === currentStep;
        const isComplete = step.number < currentStep;

        return (
          <div
            key={step.number}
            className={cn(
              "flex items-center gap-2 text-sm",
              isActive ? "font-semibold text-foreground" : "text-muted-foreground",
            )}
          >
            <span
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full border text-xs",
                isActive && "border-foreground text-foreground",
                isComplete && "border-foreground/40 text-foreground",
              )}
            >
              {step.number}
            </span>
            <span>{step.label}</span>
          </div>
        );
      })}
    </div>
  );
}
