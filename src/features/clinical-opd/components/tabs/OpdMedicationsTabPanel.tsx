"use client";

import { Pill } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  OpdEncounterRecordList,
  OpdEncounterRecordListItem,
} from "@/features/clinical-opd/components/detail/OpdEncounterRecordList";
import { OpdEncounterTabEmptyState } from "@/features/clinical-opd/components/detail/OpdEncounterTabEmptyState";
import { OpdEncounterTabSkeleton } from "@/features/clinical-opd/components/detail/OpdEncounterTabSkeleton";
import { OpdPhysicianTabShell } from "@/features/clinical-opd/components/detail/OpdPhysicianTabShell";
import { useOpdEncounterWorkspace } from "@/features/clinical-opd/components/detail/opd-encounter-workspace-context";
import { useEncounterWorkspace } from "@/features/clinical-opd/hooks/use-clinical-opd";

type OpdMedicationsTabPanelProps = {
  visitUuid: string;
  encounterUuid: string;
  isActive?: boolean;
};

export function OpdMedicationsTabPanel({
  visitUuid,
  encounterUuid,
  isActive = true,
}: OpdMedicationsTabPanelProps) {
  const { encounter } = useOpdEncounterWorkspace();
  const { prescriptions } = useEncounterWorkspace(visitUuid, encounterUuid);

  if (!isActive) {
    return null;
  }

  if (prescriptions.isLoading) {
    return <OpdEncounterTabSkeleton rows={4} />;
  }

  const items = prescriptions.data ?? [];

  if (items.length === 0) {
    return (
      <OpdPhysicianTabShell visitUuid={visitUuid} encounterUuid={encounterUuid}>
        <OpdEncounterTabEmptyState
          icon={Pill}
          title="No medications recorded"
          description="Prescriptions and medication orders for this encounter will appear here."
          data-testid="opd-medications-empty-state"
        />
      </OpdPhysicianTabShell>
    );
  }

  return (
    <OpdPhysicianTabShell visitUuid={visitUuid} encounterUuid={encounterUuid}>
      <OpdEncounterRecordList
        title={
          <span className="inline-flex items-center gap-1.5">
            <Pill className="size-4 text-brand-primary" aria-hidden="true" />
            <span>Medications</span>
          </span>
        }
        description="Prescriptions and medication orders for this encounter."
        data-testid="opd-medications-list"
      >
        {items.map((prescription) => (
          <OpdEncounterRecordListItem
            key={prescription.uuid}
            compact
            icon={Pill}
            title={prescription.product_name}
            badges={<Badge variant="outline">{prescription.status}</Badge>}
            description={
              <p>
                {prescription.dose} · {prescription.route} · {prescription.frequency}
                {prescription.duration ? ` · ${prescription.duration}` : ""}
              </p>
            }
            dateTime={encounter?.started_at ?? new Date(0).toISOString()}
            createdByName={prescription.prescribed_by_name}
          />
        ))}
      </OpdEncounterRecordList>
    </OpdPhysicianTabShell>
  );
}
