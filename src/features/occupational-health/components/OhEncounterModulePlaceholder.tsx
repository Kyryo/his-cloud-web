"use client";

import { Construction } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import {
  OH_ENCOUNTER_MODULES,
  type OhEncounterModuleId,
} from "@/features/occupational-health/lib/oh-encounter-modules";

type OhEncounterModulePlaceholderProps = {
  moduleId: Exclude<OhEncounterModuleId, "medical-examinations" | "certificate">;
};

export function OhEncounterModulePlaceholder({
  moduleId,
}: OhEncounterModulePlaceholderProps) {
  const module = OH_ENCOUNTER_MODULES.find((row) => row.id === moduleId);
  const title = module?.label ?? "Module";

  return (
    <div
      className="flex min-h-full flex-1 items-center justify-center bg-white px-6 py-16"
      data-testid={`oh-module-placeholder-${moduleId}`}
    >
      <EmptyState
        icon={Construction}
        title={`${title} is coming soon`}
        description="This Occupational Health module is visible for planning, but capture workflows are not available yet."
      />
    </div>
  );
}
