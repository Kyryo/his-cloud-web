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
  return (
    <div
      className={cn(
        "flex gap-2",
        orientation === "vertical" ? "flex-col" : "flex-row items-center",
      )}
    >
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
