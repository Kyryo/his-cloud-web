"use client";

import { useEffect, useState, type FormEvent } from "react";

import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { SectionedDialog } from "@/components/ui/sectioned-dialog";
import { useUpdateObservation } from "@/features/clinical-opd/hooks/use-clinical-opd";
import type { EncounterObservation } from "@/features/clinical-opd/types/clinical-opd.types";
import {
  formatVitalRangeHint,
  statusForNumericValue,
} from "@/features/clinical-opd/utils/opd-encounter-vitals";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage } from "@/lib/bff-field-errors";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

export const EDIT_VITAL_FORM_ID = "opd-edit-vital-form";

export type OpdEditVitalTarget =
  | { kind: "single"; observation: EncounterObservation }
  | {
      kind: "blood-pressure";
      systolic: EncounterObservation | null;
      diastolic: EncounterObservation | null;
    };

type OpdEditVitalDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  visitUuid: string;
  encounterUuid: string;
  target: OpdEditVitalTarget | null;
};

function formatUnitLabel(unit: string, code: string): string {
  if (code === "pain_score") return "/10";
  if (unit === "C") return "°C";
  if (unit === "breaths/min") return "/min";
  return unit;
}

function displayLabel(code: string, fallback: string): string {
  switch (code) {
    case "pulse":
      return "Heart rate";
    case "respiratory_rate":
      return "Resp. rate";
    case "spo2":
      return "SpO₂";
    case "blood_glucose":
      return "Blood glucose";
    case "pain_score":
      return "Pain score";
    case "bp_systolic":
      return "Systolic";
    case "bp_diastolic":
      return "Diastolic";
    default:
      return fallback;
  }
}

function observationValue(observation: EncounterObservation): string {
  return String(observation.numeric_value ?? observation.text_value ?? "");
}

type EditFieldProps = {
  id: string;
  label: string;
  code: string;
  unit: string;
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
};

function EditField({
  id,
  label,
  code,
  unit,
  value,
  disabled,
  onChange,
}: EditFieldProps) {
  const rangeHint = formatVitalRangeHint(code, unit);
  const status = statusForNumericValue(code, value);
  const outOfRange = status === "high" || status === "low";

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <Label htmlFor={id} className="text-xs font-medium text-brand-muted">
          {label}
        </Label>
        {rangeHint ? (
          <span className="text-[11px] tabular-nums text-dash-muted">
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
          data-testid={`opd-edit-vital-field-${code}`}
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

export function OpdEditVitalDialog({
  open,
  onOpenChange,
  visitUuid,
  encounterUuid,
  target,
}: OpdEditVitalDialogProps) {
  const { toast } = useToast();
  const updateObservation = useUpdateObservation(visitUuid, encounterUuid);
  const [singleValue, setSingleValue] = useState("");
  const [systolicValue, setSystolicValue] = useState("");
  const [diastolicValue, setDiastolicValue] = useState("");

  useEffect(() => {
    if (!open || !target) return;
    if (target.kind === "single") {
      setSingleValue(observationValue(target.observation));
      return;
    }
    setSystolicValue(
      target.systolic ? observationValue(target.systolic) : "",
    );
    setDiastolicValue(
      target.diastolic ? observationValue(target.diastolic) : "",
    );
  }, [open, target]);

  const isSaving = updateObservation.isPending;
  const title =
    target?.kind === "blood-pressure"
      ? "Edit blood pressure"
      : target
        ? `Edit ${displayLabel(target.observation.definition_code, target.observation.definition_name)}`
        : "Edit vital sign";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!target) return;

    try {
      if (target.kind === "single") {
        const raw = singleValue.trim();
        if (!raw) {
          toast({
            title: "Value required",
            description: "Enter a value before saving.",
            variant: "error",
          });
          return;
        }
        await updateObservation.mutateAsync({
          observationUuid: target.observation.uuid,
          payload: {
            numeric_value: raw,
            text_value: "",
            unit: target.observation.unit,
          },
        });
      } else {
        const systolic = systolicValue.trim();
        const diastolic = diastolicValue.trim();
        if (!systolic || !diastolic) {
          toast({
            title: "Blood pressure incomplete",
            description: "Enter both systolic and diastolic values.",
            variant: "error",
          });
          return;
        }
        const updates: Array<Promise<unknown>> = [];
        if (target.systolic) {
          updates.push(
            updateObservation.mutateAsync({
              observationUuid: target.systolic.uuid,
              payload: {
                numeric_value: systolic,
                text_value: "",
                unit: target.systolic.unit || "mmHg",
              },
            }),
          );
        }
        if (target.diastolic) {
          updates.push(
            updateObservation.mutateAsync({
              observationUuid: target.diastolic.uuid,
              payload: {
                numeric_value: diastolic,
                text_value: "",
                unit: target.diastolic.unit || "mmHg",
              },
            }),
          );
        }
        await Promise.all(updates);
      }

      toast({
        title: "Vital sign updated",
        variant: "success",
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Could not update vital sign",
        description:
          error instanceof BffError
            ? formatBffErrorMessage(error.message, error.errors)
            : "Unable to save this reading.",
        variant: "error",
      });
    }
  }

  return (
    <SectionedDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description="Update the recorded value for this visit."
      className={cn(appFont.className, "sm:max-w-md")}
      data-testid="opd-edit-vital-dialog"
      footer={
        <>
          <SecondaryButton
            type="button"
            disabled={isSaving}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </SecondaryButton>
          <PrimaryButton
            type="submit"
            form={EDIT_VITAL_FORM_ID}
            disabled={isSaving || !target}
            data-testid="opd-edit-vital-save"
          >
            {isSaving ? "Saving..." : "Save"}
          </PrimaryButton>
        </>
      }
    >
      {target ? (
        <form
          id={EDIT_VITAL_FORM_ID}
          className="space-y-4"
          onSubmit={(event) => {
            void handleSubmit(event);
          }}
        >
          {target.kind === "single" ? (
            <EditField
              id="opd-edit-vital-value"
              label={displayLabel(
                target.observation.definition_code,
                target.observation.definition_name,
              )}
              code={target.observation.definition_code}
              unit={formatUnitLabel(
                target.observation.unit,
                target.observation.definition_code,
              )}
              value={singleValue}
              disabled={isSaving}
              onChange={setSingleValue}
            />
          ) : (
            <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2">
              <EditField
                id="opd-edit-vital-systolic"
                label="Systolic"
                code="bp_systolic"
                unit=""
                value={systolicValue}
                disabled={isSaving || !target.systolic}
                onChange={setSystolicValue}
              />
              <span
                className="mb-2 text-sm font-medium text-dash-muted"
                aria-hidden="true"
              >
                /
              </span>
              <EditField
                id="opd-edit-vital-diastolic"
                label="Diastolic"
                code="bp_diastolic"
                unit="mmHg"
                value={diastolicValue}
                disabled={isSaving || !target.diastolic}
                onChange={setDiastolicValue}
              />
            </div>
          )}
        </form>
      ) : null}
    </SectionedDialog>
  );
}
