import { cn } from "@/lib/utils";

type Step = {
  number: number;
  label: string;
};

type StepIndicatorProps = {
  currentStep: number;
  steps: Step[];
  orientation?: "horizontal" | "vertical";
};

export function StepIndicator({
  currentStep,
  steps,
  orientation = "horizontal",
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
                {isComplete ? "✓" : step.number}
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
