"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Activity } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import {
  OpdConsultContentPanel,
  OpdConsultFormLocked,
  OpdConsultFormPanel,
  OpdConsultLayout,
} from "@/features/clinical-opd/components/detail/OpdConsultLayout";
import {
  OpdEditVitalDialog,
  type OpdEditVitalTarget,
} from "@/features/clinical-opd/components/detail/OpdEditVitalDialog";
import { OpdEncounterTabEmptyState } from "@/features/clinical-opd/components/detail/OpdEncounterTabEmptyState";
import { OpdEncounterTabSkeleton } from "@/features/clinical-opd/components/detail/OpdEncounterTabSkeleton";
import { OpdVitalSetCard } from "@/features/clinical-opd/components/detail/OpdVitalSetCard";
import { useOpdEncounterWorkspace } from "@/features/clinical-opd/components/detail/opd-encounter-workspace-context";
import {
  useCreateObservation,
  useEncounterWorkspace,
  useObservationDefinitions,
} from "@/features/clinical-opd/hooks/use-clinical-opd";
import type {
  EncounterObservation,
  ObservationDefinition,
} from "@/features/clinical-opd/types/clinical-opd.types";
import {
  formatVitalRangeHint,
  groupObservationsIntoVitalSets,
  statusForNumericValue,
  type OpdVitalSet,
} from "@/features/clinical-opd/utils/opd-encounter-vitals";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage } from "@/lib/bff-field-errors";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

export const VITAL_SIGNS_FORM_ID = "opd-vital-signs-form";

const VITALS_HISTORY_SECTIONS = ["vitals"] as const;

type OpdVitalSignsTabPanelProps = {
  visitUuid: string;
  encounterUuid: string;
  isActive?: boolean;
};

/** Single-code fields shown on the form (BMI is calculated, not entered). */
const SINGLE_FIELD_CODES = [
  "temperature",
  "pulse",
  "respiratory_rate",
  "spo2",
  "weight",
  "height",
  "blood_glucose",
  "pain_score",
] as const;

type SingleFieldCode = (typeof SINGLE_FIELD_CODES)[number];

const FIELD_LABELS: Record<SingleFieldCode | "bp_systolic" | "bp_diastolic", string> = {
  temperature: "Temperature",
  pulse: "Heart rate",
  respiratory_rate: "Resp. rate",
  spo2: "SpO₂",
  weight: "Weight",
  height: "Height",
  blood_glucose: "Blood glucose",
  pain_score: "Pain score",
  bp_systolic: "Systolic",
  bp_diastolic: "Diastolic",
};

function formatUnitLabel(unit: string, code: string): string {
  if (code === "pain_score") return "/10";
  if (unit === "C") return "°C";
  if (unit === "breaths/min") return "/min";
  return unit;
}

function emptyValues(): Record<string, string> {
  return {
    temperature: "",
    pulse: "",
    respiratory_rate: "",
    spo2: "",
    weight: "",
    height: "",
    blood_glucose: "",
    pain_score: "",
    bp_systolic: "",
    bp_diastolic: "",
  };
}

function latestInSet(
  set: OpdVitalSet,
  code: string,
): EncounterObservation | null {
  return (
    set.observations
      .filter((observation) => observation.definition_code === code)
      .sort(
        (left, right) =>
          new Date(right.recorded_at).getTime() -
          new Date(left.recorded_at).getTime(),
      )[0] ?? null
  );
}

function editTargetForStat(
  set: OpdVitalSet,
  statKey: string,
): OpdEditVitalTarget | null {
  if (statKey === "blood-pressure") {
    const systolic = latestInSet(set, "bp_systolic");
    const diastolic = latestInSet(set, "bp_diastolic");
    if (!systolic && !diastolic) return null;
    return { kind: "blood-pressure", systolic, diastolic };
  }

  const code =
    statKey === "heart-rate"
      ? "pulse"
      : statKey === "temperature"
        ? "temperature"
        : statKey === "weight"
          ? "weight"
          : statKey;

  const observation = latestInSet(set, code);
  if (!observation) return null;
  return { kind: "single", observation };
}

type VitalFieldProps = {
  id: string;
  label: string;
  code: string;
  unit: string;
  value: string;
  disabled?: boolean;
  className?: string;
  onChange: (value: string) => void;
};

function VitalField({
  id,
  label,
  code,
  unit,
  value,
  disabled,
  className,
  onChange,
}: VitalFieldProps) {
  const rangeHint = formatVitalRangeHint(code, unit);
  const status = statusForNumericValue(code, value);
  const outOfRange = status === "high" || status === "low";

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
        <Label htmlFor={id} className="text-xs font-medium text-brand-muted">
          {label}
        </Label>
        {rangeHint ? (
          <span className="text-[10px] tabular-nums text-dash-muted">
            {rangeHint}
          </span>
        ) : null}
      </div>
      <InputGroup
        className={cn(
          "h-9 bg-white shadow-none",
          outOfRange && "border-red-300",
        )}
      >
        <InputGroupInput
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          inputMode="decimal"
          autoComplete="off"
          disabled={disabled}
          className={cn(outOfRange && "text-red-600")}
          aria-invalid={outOfRange || undefined}
          data-testid={`opd-vital-field-${id}`}
        />
        {unit ? (
          <InputGroupAddon align="inline-end">
            <InputGroupText className="text-xs tabular-nums text-dash-muted">
              {unit}
            </InputGroupText>
          </InputGroupAddon>
        ) : null}
      </InputGroup>
    </div>
  );
}

export function OpdVitalSignsTabPanel({
  visitUuid,
  encounterUuid,
  isActive = true,
}: OpdVitalSignsTabPanelProps) {
  const { toast } = useToast();
  const { isChartLocked, capabilities } = useOpdEncounterWorkspace();
  const { observations } = useEncounterWorkspace(visitUuid, encounterUuid);
  const definitions = useObservationDefinitions();
  const createObservation = useCreateObservation(visitUuid, encounterUuid);
  const [values, setValues] = useState(emptyValues);
  const [isSaving, setIsSaving] = useState(false);
  const [editTarget, setEditTarget] = useState<OpdEditVitalTarget | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const canWrite = capabilities.includes("record_vitals") && !isChartLocked;

  const definitionMap = useMemo(() => {
    const map = new Map<string, ObservationDefinition>();
    for (const definition of definitions.data ?? []) {
      map.set(definition.code, definition);
    }
    return map;
  }, [definitions.data]);

  if (!isActive) {
    return null;
  }

  if (observations.isLoading || definitions.isLoading) {
    return <OpdEncounterTabSkeleton rows={4} />;
  }

  const vitalItems = observations.data ?? [];
  const vitalSets = groupObservationsIntoVitalSets(vitalItems);

  function setField(code: string, next: string) {
    setValues((current) => ({ ...current, [code]: next }));
  }

  function openEdit(set: OpdVitalSet, statKey: string) {
    if (!canWrite) return;
    const target = editTargetForStat(set, statKey);
    if (!target) return;
    setEditTarget(target);
    setEditOpen(true);
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const systolic = values.bp_systolic.trim();
    const diastolic = values.bp_diastolic.trim();
    if ((systolic && !diastolic) || (!systolic && diastolic)) {
      toast({
        title: "Blood pressure incomplete",
        description: "Enter both systolic and diastolic, or leave both blank.",
        variant: "error",
      });
      return;
    }

    const payloads: Array<{
      definition_uuid: string;
      numeric_value?: string;
      text_value: string;
      unit: string;
    }> = [];

    for (const code of SINGLE_FIELD_CODES) {
      const raw = values[code]?.trim() ?? "";
      if (!raw) continue;
      const definition = definitionMap.get(code);
      if (!definition) continue;
      payloads.push({
        definition_uuid: definition.uuid,
        numeric_value: definition.value_type !== "text" ? raw : undefined,
        text_value: definition.value_type === "text" ? raw : "",
        unit: definition.default_unit,
      });
    }

    for (const code of ["bp_systolic", "bp_diastolic"] as const) {
      const raw = values[code]?.trim() ?? "";
      if (!raw) continue;
      const definition = definitionMap.get(code);
      if (!definition) continue;
      payloads.push({
        definition_uuid: definition.uuid,
        numeric_value: raw,
        text_value: "",
        unit: definition.default_unit,
      });
    }

    if (payloads.length === 0) {
      toast({
        title: "Nothing to save",
        description: "Enter at least one vital sign before saving.",
        variant: "error",
      });
      return;
    }

    setIsSaving(true);
    try {
      await Promise.all(
        payloads.map((payload) => createObservation.mutateAsync(payload)),
      );
      setValues(emptyValues());
      toast({
        title:
          payloads.length === 1
            ? "Vital sign saved"
            : `${payloads.length} vital signs saved`,
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Could not save vital signs",
        description:
          error instanceof BffError
            ? formatBffErrorMessage(error.message, error.errors)
            : "Unable to record vital signs for this encounter.",
        variant: "error",
      });
    } finally {
      setIsSaving(false);
    }
  }

  const systolicStatus = statusForNumericValue("bp_systolic", values.bp_systolic);
  const diastolicStatus = statusForNumericValue(
    "bp_diastolic",
    values.bp_diastolic,
  );
  const systolicOut =
    systolicStatus === "high" || systolicStatus === "low";
  const diastolicOut =
    diastolicStatus === "high" || diastolicStatus === "low";

  const content =
    vitalSets.length === 0 ? (
      <OpdEncounterTabEmptyState
        icon={Activity}
        title="No vital signs recorded"
        description="Each time you save, a new set of readings appears here for this visit."
        data-testid="opd-vital-signs-empty-state"
      />
    ) : (
      <ul className="space-y-3" data-testid="opd-vital-signs-list">
        {vitalSets.map((set) => (
          <li key={set.id}>
            <OpdVitalSetCard
              set={set}
              onValueClick={
                canWrite ? (statKey) => openEdit(set, statKey) : undefined
              }
            />
          </li>
        ))}
      </ul>
    );

  return (
    <>
      <OpdConsultLayout
        wideForm
        historySection="vitals"
        historyAllowedSections={VITALS_HISTORY_SECTIONS}
        data-testid="opd-vital-signs-layout"
        form={
          canWrite ? (
            <OpdConsultFormPanel
              title="Vital signs"
              description="Enter the readings you have. Empty fields are skipped."
              action={
                <Button
                  type="submit"
                  form={VITAL_SIGNS_FORM_ID}
                  size="sm"
                  className="h-8"
                  disabled={isSaving}
                  data-testid="opd-vital-signs-header-save"
                >
                  {isSaving ? "Saving..." : "Save"}
                </Button>
              }
            >
              <form
                id={VITAL_SIGNS_FORM_ID}
                className="space-y-4"
                data-testid="opd-record-vital-form"
                onSubmit={(event) => {
                  void handleSave(event);
                }}
              >
                <div className="grid grid-cols-2 gap-3">
                  {(["temperature", "pulse"] as const).map((code) => {
                    const definition = definitionMap.get(code);
                    if (!definition) return null;
                    return (
                      <VitalField
                        key={code}
                        id={code}
                        label={FIELD_LABELS[code]}
                        code={code}
                        unit={formatUnitLabel(definition.default_unit, code)}
                        value={values[code]}
                        disabled={isSaving}
                        onChange={(next) => setField(code, next)}
                      />
                    );
                  })}

                  {definitionMap.has("bp_systolic") ||
                  definitionMap.has("bp_diastolic") ? (
                    <div className="col-span-2 space-y-1.5">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                        <p className="text-xs font-medium text-brand-muted">
                          Blood pressure
                        </p>
                        <span className="text-[10px] tabular-nums text-dash-muted">
                          {formatVitalRangeHint("bp_systolic")}/
                          {formatVitalRangeHint("bp_diastolic")} mmHg
                        </span>
                      </div>
                      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                        <InputGroup
                          className={cn(
                            "h-9 bg-white shadow-none",
                            systolicOut && "border-red-300",
                          )}
                        >
                          <InputGroupInput
                            id="bp_systolic"
                            aria-label="Systolic blood pressure"
                            value={values.bp_systolic}
                            onChange={(event) =>
                              setField("bp_systolic", event.target.value)
                            }
                            inputMode="numeric"
                            autoComplete="off"
                            disabled={isSaving}
                            className={cn(systolicOut && "text-red-600")}
                            aria-invalid={systolicOut || undefined}
                            data-testid="opd-vital-field-bp_systolic"
                          />
                        </InputGroup>
                        <span
                          className="text-sm font-medium text-dash-muted"
                          aria-hidden="true"
                        >
                          /
                        </span>
                        <InputGroup
                          className={cn(
                            "h-9 bg-white shadow-none",
                            diastolicOut && "border-red-300",
                          )}
                        >
                          <InputGroupInput
                            id="bp_diastolic"
                            aria-label="Diastolic blood pressure"
                            value={values.bp_diastolic}
                            onChange={(event) =>
                              setField("bp_diastolic", event.target.value)
                            }
                            inputMode="numeric"
                            autoComplete="off"
                            disabled={isSaving}
                            className={cn(diastolicOut && "text-red-600")}
                            aria-invalid={diastolicOut || undefined}
                            data-testid="opd-vital-field-bp_diastolic"
                          />
                          <InputGroupAddon align="inline-end">
                            <InputGroupText className="text-xs tabular-nums text-dash-muted">
                              mmHg
                            </InputGroupText>
                          </InputGroupAddon>
                        </InputGroup>
                      </div>
                    </div>
                  ) : null}

                  {(
                    [
                      "respiratory_rate",
                      "spo2",
                      "weight",
                      "height",
                      "blood_glucose",
                      "pain_score",
                    ] as const
                  ).map((code) => {
                    const definition = definitionMap.get(code);
                    if (!definition) return null;
                    return (
                      <VitalField
                        key={code}
                        id={code}
                        label={FIELD_LABELS[code]}
                        code={code}
                        unit={formatUnitLabel(definition.default_unit, code)}
                        value={values[code]}
                        disabled={isSaving}
                        onChange={(next) => setField(code, next)}
                      />
                    );
                  })}
                </div>
              </form>
            </OpdConsultFormPanel>
          ) : (
            <OpdConsultFormPanel title="Vital signs">
              <OpdConsultFormLocked message="You can review vital signs for this encounter, but you cannot record new readings." />
            </OpdConsultFormPanel>
          )
        }
        content={
          <OpdConsultContentPanel title="This visit" count={vitalSets.length}>
            {content}
          </OpdConsultContentPanel>
        }
      />

      <OpdEditVitalDialog
        open={editOpen}
        onOpenChange={(nextOpen) => {
          setEditOpen(nextOpen);
          if (!nextOpen) {
            setEditTarget(null);
          }
        }}
        visitUuid={visitUuid}
        encounterUuid={encounterUuid}
        target={editTarget}
      />
    </>
  );
}
