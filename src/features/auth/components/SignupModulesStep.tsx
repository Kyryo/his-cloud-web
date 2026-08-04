"use client";

import {
  Activity,
  Building2,
  Check,
  ClipboardList,
  FlaskConical,
  Hospital,
  Microscope,
  Pill,
  Scan,
  Smile,
  Stethoscope,
  Wallet,
} from "lucide-react";
import { useCallback, useState } from "react";

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

const CLINIC_ARCHETYPES = [
  {
    id: "private-clinic",
    label: "Private clinic",
    description: "Outpatient care, billing, and day-to-day operations.",
    Icon: Building2,
    modules: ["registration", "billing", "clinical"],
  },
  {
    id: "hospital",
    label: "Hospital",
    description: "Departments, inpatient workflows, and broader ops.",
    Icon: Hospital,
    modules: ["registration", "billing", "clinical", "inventory"],
  },
  {
    id: "laboratory",
    label: "Laboratory",
    description: "Orders, results, and reporting for diagnostics.",
    Icon: Microscope,
    modules: ["registration", "lab"],
  },
] as const;

type SignupModulesStepProps = {
  selectedModuleIds: string[];
  onSelectedModuleIdsChange: (moduleIds: string[]) => void;
  error?: string | null;
};

export function SignupModulesStep({
  selectedModuleIds,
  onSelectedModuleIdsChange,
  error,
}: SignupModulesStepProps) {
  const { toast } = useToast();
  const [localError, setLocalError] = useState<string | null>(null);
  const [archetypeId, setArchetypeId] = useState<string | null>(null);
  const [showCustomModules, setShowCustomModules] = useState(false);

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
      setArchetypeId(null);
    },
    [onSelectedModuleIdsChange, selectedModuleIds, toast],
  );

  function selectArchetype(id: (typeof CLINIC_ARCHETYPES)[number]["id"]) {
    const archetype = CLINIC_ARCHETYPES.find((item) => item.id === id);
    if (!archetype) return;
    setArchetypeId(id);
    onSelectedModuleIdsChange([...archetype.modules]);
    setLocalError(null);
    setShowCustomModules(false);
  }

  const displayError = error ?? localError;

  return (
    <div className="flex flex-1 flex-col space-y-5">
      <div className="space-y-3">
        <p className="text-sm font-medium text-brand-navy">
          Which best describes your practice?
        </p>
        <div className="grid gap-3">
          {CLINIC_ARCHETYPES.map((archetype) => {
            const isSelected = archetypeId === archetype.id;
            const Icon = archetype.Icon;
            return (
              <button
                key={archetype.id}
                type="button"
                onClick={() => selectArchetype(archetype.id)}
                className={cn(
                  "group flex items-start gap-3.5 rounded-2xl border px-4 py-4 text-left transition-all duration-200",
                  isSelected
                    ? "border-brand-primary bg-brand-tint/40 shadow-[0_0_0_1px_var(--color-brand-primary)]"
                    : "border-slate-200 bg-white hover:border-brand-primary/35 hover:bg-slate-50/80",
                )}
                data-testid={`signup-archetype-${archetype.id}`}
              >
                <span
                  className={cn(
                    "flex size-11 shrink-0 items-center justify-center rounded-xl transition-colors",
                    isSelected
                      ? "bg-brand-primary text-white"
                      : "bg-slate-100 text-brand-muted group-hover:bg-brand-tint group-hover:text-brand-primary",
                  )}
                >
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1 pt-0.5">
                  <span className="block text-[15px] font-semibold text-brand-navy">
                    {archetype.label}
                  </span>
                  <span className="mt-1 block text-sm leading-relaxed text-brand-muted">
                    {archetype.description}
                  </span>
                </span>
                <span
                  className={cn(
                    "mt-1 flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                    isSelected
                      ? "border-brand-primary bg-brand-primary text-white"
                      : "border-slate-300 bg-white",
                  )}
                  aria-hidden="true"
                >
                  {isSelected ? <Check className="size-3" strokeWidth={3} /> : null}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        className="text-left text-sm font-medium text-brand-primary hover:underline"
        onClick={() => setShowCustomModules((value) => !value)}
        data-testid="signup-customize-modules"
      >
        {showCustomModules ? "Hide module details" : "Customize modules"}
      </button>

      {showCustomModules ? (
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {ONBOARDING_MODULE_OPTIONS.map((module) => {
            const isSelected = selectedModuleIds.includes(module.id);
            const Icon =
              MODULE_ICONS[module.id as keyof typeof MODULE_ICONS] ?? Activity;

            return (
              <button
                key={module.id}
                type="button"
                onClick={() => toggleModule(module.id)}
                className={cn(
                  "flex items-start gap-3 rounded-2xl border p-3.5 text-left transition-all duration-200",
                  isSelected
                    ? "border-brand-primary bg-brand-tint/40"
                    : "border-slate-200 bg-white hover:border-brand-primary/35",
                )}
                data-testid={`signup-module-${module.id}`}
              >
                <span
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-lg",
                    isSelected
                      ? "bg-brand-primary text-white"
                      : "bg-slate-100 text-brand-muted",
                  )}
                >
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-brand-navy">
                    {module.label}
                  </span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-brand-muted">
                    {module.description}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      ) : null}

      <p className="text-xs leading-relaxed text-brand-muted">
        {REGISTRATION_MODULE_NAME} is included automatically. You can change
        modules later in settings.
      </p>

      {displayError ? (
        <p role="alert" className="text-sm text-destructive">
          {displayError}
        </p>
      ) : null}
    </div>
  );
}
