"use client";

import {
  Activity,
  ClipboardList,
  FlaskConical,
  Pill,
  Scan,
  Smile,
  Stethoscope,
  Wallet,
} from "lucide-react";
import { useCallback, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  ONBOARDING_MODULE_OPTIONS,
  REGISTRATION_MODULE_NAME,
} from "@/features/auth/constants/onboarding-modules";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

const MODULE_ICONS = {
  registration: ClipboardList,
  billing: Wallet,
  inventory: Activity,
  dispensation: Pill,
  lab: FlaskConical,
  radiology: Scan,
  dental: Smile,
  clinical: Stethoscope,
} as const;

type SignupModulesStepProps = {
  selectedModuleIds: string[];
  onSelectedModuleIdsChange: (moduleIds: string[]) => void;
  onBack: () => void;
  onSubmit: () => void | Promise<void>;
  isSubmitting?: boolean;
  error?: string | null;
};

export function SignupModulesStep({
  selectedModuleIds,
  onSelectedModuleIdsChange,
  onBack,
  onSubmit,
  isSubmitting = false,
  error,
}: SignupModulesStepProps) {
  const { toast } = useToast();
  const [localError, setLocalError] = useState<string | null>(null);

  const toggleModule = useCallback(
    (moduleId: string) => {
      const isSelected = selectedModuleIds.includes(moduleId);
      const registrationId = "registration";

      if (
        isSelected &&
        moduleId === registrationId &&
        selectedModuleIds.length > 1
      ) {
        toast({
          variant: "warning",
          title: "Front desk is required",
          description:
            "Registration stays enabled while other modules are selected.",
        });
        return;
      }

      let nextSelection: string[];

      if (isSelected) {
        nextSelection = selectedModuleIds.filter((id) => id !== moduleId);
        if (
          nextSelection.length > 0 &&
          !nextSelection.includes(registrationId)
        ) {
          nextSelection = [...nextSelection, registrationId];
        }
      } else {
        nextSelection = [...selectedModuleIds, moduleId];
        if (!nextSelection.includes(registrationId)) {
          nextSelection = [...nextSelection, registrationId];
        }
      }

      onSelectedModuleIdsChange(nextSelection);
      setLocalError(null);
    },
    [onSelectedModuleIdsChange, selectedModuleIds, toast],
  );

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (selectedModuleIds.length === 0) {
      setLocalError("Select at least one module to continue.");
      return;
    }

    setLocalError(null);
    await onSubmit();
  }

  const displayError = error ?? localError;

  return (
    <form className="space-y-6" onSubmit={(event) => void handleSubmit(event)}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {ONBOARDING_MODULE_OPTIONS.map((module) => {
          const isSelected = selectedModuleIds.includes(module.id);
          const Icon =
            MODULE_ICONS[module.id as keyof typeof MODULE_ICONS] ?? Activity;

          return (
            <button
              key={module.id}
              type="button"
              disabled={isSubmitting}
              onClick={() => toggleModule(module.id)}
              className={cn(
                "flex items-start gap-3 rounded-xl border p-4 text-left transition-colors",
                isSelected
                  ? "border-brand-primary bg-brand-tint/40"
                  : "border-brand-border bg-white hover:border-brand-primary/40 hover:bg-slate-50/80",
                isSubmitting && "cursor-not-allowed opacity-60",
              )}
              data-testid={`signup-module-${module.id}`}
            >
              <span
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-lg",
                  isSelected
                    ? "bg-brand-primary text-white"
                    : "bg-slate-100 text-brand-muted",
                )}
              >
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-brand-navy">
                  {module.label}
                </span>
                <span className="mt-1 block text-xs leading-relaxed text-brand-muted">
                  {module.description}
                </span>
              </span>
              <span
                className={cn(
                  "mt-1 size-4 shrink-0 rounded-full border-2",
                  isSelected
                    ? "border-brand-primary bg-brand-primary"
                    : "border-brand-border bg-white",
                )}
                aria-hidden="true"
              />
            </button>
          );
        })}
      </div>

      <p className="text-xs text-brand-muted">
        {REGISTRATION_MODULE_NAME} is included automatically when you enable
        other modules. You can change modules later in settings.
      </p>

      {displayError ? (
        <p role="alert" className="text-sm text-destructive">
          {displayError}
        </p>
      ) : null}

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-between">
        <Button
          type="button"
          variant="outline"
          className="h-11"
          disabled={isSubmitting}
          onClick={onBack}
        >
          Back
        </Button>
        <Button
          type="submit"
          data-testid="signup-submit"
          className="h-11 min-w-[10rem] bg-brand-primary hover:bg-brand-primary-hover"
          disabled={isSubmitting || selectedModuleIds.length === 0}
        >
          {isSubmitting ? "Creating workspace..." : "Create workspace"}
        </Button>
      </div>
    </form>
  );
}
