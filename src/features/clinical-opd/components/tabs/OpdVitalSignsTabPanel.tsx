"use client";

import { useState } from "react";
import { Activity } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RequiredFieldMarker } from "@/components/ui/required-field-marker";
import {
  OpdEncounterRecordList,
  OpdEncounterRecordListItem,
} from "@/features/clinical-opd/components/detail/OpdEncounterRecordList";
import { OpdEncounterTabEmptyState } from "@/features/clinical-opd/components/detail/OpdEncounterTabEmptyState";
import { OpdEncounterTabSkeleton } from "@/features/clinical-opd/components/detail/OpdEncounterTabSkeleton";
import { useOpdEncounterWorkspace } from "@/features/clinical-opd/components/detail/opd-encounter-workspace-context";
import {
  useCreateObservation,
  useEncounterWorkspace,
  useObservationDefinitions,
} from "@/features/clinical-opd/hooks/use-clinical-opd";

type OpdVitalSignsTabPanelProps = {
  visitUuid: string;
  encounterUuid: string;
  isActive?: boolean;
};

export function OpdVitalSignsTabPanel({
  visitUuid,
  encounterUuid,
  isActive = true,
}: OpdVitalSignsTabPanelProps) {
  const { isChartLocked, capabilities } = useOpdEncounterWorkspace();
  const { observations } = useEncounterWorkspace(visitUuid, encounterUuid);
  const definitions = useObservationDefinitions();
  const createObservation = useCreateObservation(visitUuid, encounterUuid);
  const [selectedDefinition, setSelectedDefinition] = useState("");
  const [vitalValue, setVitalValue] = useState("");
  const canWrite = capabilities.includes("record_vitals") && !isChartLocked;
  const writableDefinitions = (definitions.data ?? []).filter(
    (definition) => definition.code !== "bmi",
  );

  if (!isActive) {
    return null;
  }

  if (observations.isLoading || definitions.isLoading) {
    return <OpdEncounterTabSkeleton rows={4} />;
  }

  async function handleSaveVital() {
    if (!selectedDefinition || !vitalValue.trim()) return;
    const definition = definitions.data?.find(
      (item) => item.uuid === selectedDefinition,
    );
    if (!definition) return;
    await createObservation.mutateAsync({
      definition_uuid: selectedDefinition,
      numeric_value: definition.value_type !== "text" ? vitalValue : undefined,
      text_value: definition.value_type === "text" ? vitalValue : "",
      unit: definition.default_unit,
    });
    setVitalValue("");
    setSelectedDefinition("");
  }

  const vitalItems = observations.data ?? [];

  return (
    <div className="space-y-6">
      {canWrite ? (
        <form
          className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_8rem_auto] sm:items-end"
          data-testid="opd-record-vital-form"
          onSubmit={(event) => {
            event.preventDefault();
            void handleSaveVital();
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="opd-vital-definition">Vital</Label>
            <select
              id="opd-vital-definition"
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={selectedDefinition}
              onChange={(event) => setSelectedDefinition(event.target.value)}
            >
              <option value="">Select vital</option>
              {writableDefinitions.map((definition) => (
                <option key={definition.uuid} value={definition.uuid}>
                  {definition.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="opd-vital-value">
              Value <RequiredFieldMarker />
            </Label>
            <Input
              id="opd-vital-value"
              value={vitalValue}
              onChange={(event) => setVitalValue(event.target.value)}
              inputMode="decimal"
            />
          </div>
          <Button
            type="submit"
            disabled={createObservation.isPending}
            data-testid="opd-record-vital-button"
          >
            {createObservation.isPending ? "Saving..." : "Save vital"}
          </Button>
        </form>
      ) : null}

      {vitalItems.length === 0 ? (
        <OpdEncounterTabEmptyState
          icon={Activity}
          title="No vital signs recorded"
          description="Recording vitals keeps the encounter waiting and marks the queue as ready."
          data-testid="opd-vital-signs-empty-state"
        />
      ) : (
        <OpdEncounterRecordList
          title="Vital signs"
          description="Recorded observations for this encounter."
          data-testid="opd-vital-signs-list"
        >
          {vitalItems.map((observation) => (
            <OpdEncounterRecordListItem
              key={observation.uuid}
              compact
              icon={Activity}
              title={observation.definition_name}
              description={`${observation.numeric_value ?? observation.text_value} ${observation.unit}`.trim()}
              dateTime={observation.recorded_at}
              createdByName={observation.recorded_by_name}
            />
          ))}
        </OpdEncounterRecordList>
      )}
    </div>
  );
}
