"use client";

import { useState } from "react";
import { Activity } from "lucide-react";

import { TabAddActionButton } from "@/components/ui/app-buttons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RequiredFieldMarker } from "@/components/ui/required-field-marker";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  const [vitalDialogOpen, setVitalDialogOpen] = useState(false);
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
    setVitalDialogOpen(false);
  }

  const vitalItems = observations.data ?? [];
  const recordVitalButton = canWrite ? (
    <TabAddActionButton
      label="Record vital"
      onClick={() => setVitalDialogOpen(true)}
      data-testid="opd-record-vital-button"
    />
  ) : null;

  return (
    <div className="space-y-5">
      {vitalItems.length === 0 ? (
        <OpdEncounterTabEmptyState
          icon={Activity}
          title="No vital signs recorded"
          description="Recording vitals keeps the encounter waiting and marks the queue as ready."
          action={
            canWrite ? (
              <TabAddActionButton
                label="Record vital"
                emptyState
                onClick={() => setVitalDialogOpen(true)}
              />
            ) : null
          }
          data-testid="opd-vital-signs-empty-state"
        />
      ) : (
        <OpdEncounterRecordList
          title="Vital signs"
          description="Recorded observations for this encounter."
          action={recordVitalButton}
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

      <VitalDialog
        open={vitalDialogOpen}
        onOpenChange={setVitalDialogOpen}
        definitions={writableDefinitions}
        selectedDefinition={selectedDefinition}
        vitalValue={vitalValue}
        isSaving={createObservation.isPending}
        onDefinitionChange={setSelectedDefinition}
        onValueChange={setVitalValue}
        onSave={() => void handleSaveVital()}
      />
    </div>
  );
}

type VitalDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  definitions: Array<{
    uuid: string;
    name: string;
    value_type: string;
    default_unit: string;
  }>;
  selectedDefinition: string;
  vitalValue: string;
  isSaving: boolean;
  onDefinitionChange: (value: string) => void;
  onValueChange: (value: string) => void;
  onSave: () => void;
};

function VitalDialog({
  open,
  onOpenChange,
  definitions,
  selectedDefinition,
  vitalValue,
  isSaving,
  onDefinitionChange,
  onValueChange,
  onSave,
}: VitalDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Record vital sign</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Vital</Label>
            <select
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={selectedDefinition}
              onChange={(event) => onDefinitionChange(event.target.value)}
            >
              <option value="">Select vital</option>
              {definitions.map((definition) => (
                <option key={definition.uuid} value={definition.uuid}>
                  {definition.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>
              Value <RequiredFieldMarker />
            </Label>
            <Input
              value={vitalValue}
              onChange={(event) => onValueChange(event.target.value)}
              inputMode="decimal"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="button" disabled={isSaving} onClick={onSave}>
            {isSaving ? "Saving..." : "Save vital"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
