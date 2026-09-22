"use client";

import { Activity } from "lucide-react";

import { SecondaryButton } from "@/components/ui/app-buttons";
import { SectionedDialog } from "@/components/ui/sectioned-dialog";
import { OpdVitalSetCard } from "@/features/clinical-opd/components/detail/OpdVitalSetCard";
import type { EncounterObservation } from "@/features/clinical-opd/types/clinical-opd.types";
import { groupObservationsIntoVitalSets } from "@/features/clinical-opd/utils/opd-encounter-vitals";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";

type OpdEncounterVitalsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  observations: EncounterObservation[];
};

export function OpdEncounterVitalsDialog({
  open,
  onOpenChange,
  observations,
}: OpdEncounterVitalsDialogProps) {
  const sets = groupObservationsIntoVitalSets(observations);

  return (
    <SectionedDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Vital signs"
      description="All readings recorded on this encounter."
      className={cn(appFont.className, "sm:max-w-lg")}
      data-testid="opd-encounter-vitals-dialog"
      footer={
        <SecondaryButton type="button" onClick={() => onOpenChange(false)}>
          Close
        </SecondaryButton>
      }
    >
      {sets.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center gap-2 py-10 text-center"
          data-testid="opd-encounter-vitals-dialog-empty"
        >
          <Activity
            className="size-5 text-dash-muted"
            aria-hidden="true"
          />
          <p className="text-sm font-medium text-brand-navy">
            No vital signs recorded
          </p>
          <p className="max-w-xs text-xs text-dash-muted">
            Readings taken during this encounter will appear here.
          </p>
        </div>
      ) : (
        <ul className="space-y-3" data-testid="opd-encounter-vitals-dialog-list">
          {sets.map((set) => (
            <li key={set.id}>
              <OpdVitalSetCard set={set} />
            </li>
          ))}
        </ul>
      )}
    </SectionedDialog>
  );
}
