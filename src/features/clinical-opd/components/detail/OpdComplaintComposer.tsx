"use client";

import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RequiredFieldMarker } from "@/components/ui/required-field-marker";
import { Textarea } from "@/components/ui/textarea";
import { OpdHpiDurationFields } from "@/features/clinical-opd/components/detail/OpdHpiDurationFields";
import { OpdPastComplaintsDialog } from "@/features/clinical-opd/components/detail/OpdPastComplaintsDialog";
import {
  useChiefComplaintSuggestions,
  useCreateChiefComplaint,
  useSaveChiefComplaintHpi,
  useUpdateChiefComplaint,
} from "@/features/clinical-opd/hooks/use-clinical-opd";
import { chiefComplaintSchema } from "@/features/clinical-opd/schemas/clinical-opd.schema";
import type { ChiefComplaint } from "@/features/clinical-opd/types/clinical-opd.types";
import {
  DEFAULT_HPI_DURATION_UNIT,
  encodeHpiBody,
  isHpiDurationUnit,
  parseHpiBody,
  type HpiDuration,
  type HpiDurationUnit,
} from "@/features/clinical-opd/utils/hpi-duration";
import { formatDisplayDateTime } from "@/features/customers/utils/format-customer";

const MAX_VISIBLE_SUGGESTIONS = 3;

const complaintWithHpiSchema = chiefComplaintSchema.extend({
  durationValue: z.string().optional(),
  durationUnit: z.enum(["hours", "days", "weeks", "months", "years"]),
  hpi: z.string().optional(),
});

type ComplaintFormValues = z.infer<typeof complaintWithHpiSchema>;

function durationFromForm(
  value: string | undefined,
  unit: HpiDurationUnit,
): HpiDuration | null {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return { value: parsed, unit };
}

function defaultValuesFromComplaint(
  complaint: ChiefComplaint | null,
): ComplaintFormValues {
  const parsed = parseHpiBody(complaint?.hpi?.body);
  return {
    text: complaint?.text ?? "",
    durationValue: parsed.duration ? String(parsed.duration.value) : "",
    durationUnit: parsed.duration?.unit ?? DEFAULT_HPI_DURATION_UNIT,
    hpi: parsed.narrative,
  };
}

type OpdComplaintComposerProps = {
  visitUuid: string;
  encounterUuid: string;
  canWriteComplaint: boolean;
  canWriteHpi: boolean;
  complaint?: ChiefComplaint | null;
  onSaved?: () => void;
  onDelete?: () => void;
  formId?: string;
  /** When false, omit the in-form Save/Delete row (e.g. dialog footer). */
  showFooterActions?: boolean;
};

export function OpdComplaintComposer({
  visitUuid,
  encounterUuid,
  canWriteComplaint,
  canWriteHpi,
  complaint = null,
  onSaved,
  onDelete,
  formId,
  showFooterActions = true,
}: OpdComplaintComposerProps) {
  return (
    <OpdComplaintComposerForm
      key={complaint?.uuid ?? "new"}
      visitUuid={visitUuid}
      encounterUuid={encounterUuid}
      canWriteComplaint={canWriteComplaint}
      canWriteHpi={canWriteHpi}
      complaint={complaint}
      onSaved={onSaved}
      onDelete={onDelete}
      formId={formId}
      showFooterActions={showFooterActions}
    />
  );
}

function OpdComplaintComposerForm({
  visitUuid,
  encounterUuid,
  canWriteComplaint,
  canWriteHpi,
  complaint,
  onSaved,
  onDelete,
  formId,
  showFooterActions = true,
}: OpdComplaintComposerProps) {
  const createComplaint = useCreateChiefComplaint(visitUuid, encounterUuid);
  const updateComplaint = useUpdateChiefComplaint(visitUuid, encounterUuid);
  const saveHpi = useSaveChiefComplaintHpi(visitUuid, encounterUuid);
  const suggestionsQuery = useChiefComplaintSuggestions(
    visitUuid,
    encounterUuid,
    canWriteComplaint,
  );
  const [pastComplaintsOpen, setPastComplaintsOpen] = useState(false);
  const form = useForm<ComplaintFormValues>({
    resolver: zodResolver(complaintWithHpiSchema),
    defaultValues: defaultValuesFromComplaint(complaint ?? null),
  });
  const textValue = useWatch({ control: form.control, name: "text" }) ?? "";
  const durationValue =
    useWatch({ control: form.control, name: "durationValue" }) ?? "";
  const durationUnit =
    useWatch({ control: form.control, name: "durationUnit" }) ??
    DEFAULT_HPI_DURATION_UNIT;
  const isSaving =
    createComplaint.isPending ||
    updateComplaint.isPending ||
    saveHpi.isPending;
  const recordedMeta = complaint
    ? [formatDisplayDateTime(complaint.recorded_at), complaint.recorded_by_name]
        .filter(Boolean)
        .join(" · ")
    : "";

  const filteredSuggestions = useMemo(() => {
    const query = textValue.trim().toLowerCase();
    return (suggestionsQuery.data ?? []).filter((item) => {
      if (item.text.trim().toLowerCase() === query) {
        return false;
      }
      return !query || item.text.toLowerCase().includes(query);
    });
  }, [suggestionsQuery.data, textValue]);

  const visibleSuggestions = filteredSuggestions.slice(
    0,
    MAX_VISIBLE_SUGGESTIONS,
  );
  const hasMoreSuggestions =
    filteredSuggestions.length > MAX_VISIBLE_SUGGESTIONS;

  function applySuggestion(text: string) {
    form.setValue("text", text, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  const canEdit = canWriteComplaint || (Boolean(complaint) && canWriteHpi);

  if (!canEdit && !complaint) {
    return null;
  }

  return (
    <>
      <form
        id={formId}
        className="space-y-4"
        data-testid="opd-complaint-composer"
        onSubmit={form.handleSubmit(async (values) => {
          const nextText = values.text.trim();
          const nextHpi = encodeHpiBody(
            durationFromForm(
              values.durationValue,
              isHpiDurationUnit(values.durationUnit)
                ? values.durationUnit
                : DEFAULT_HPI_DURATION_UNIT,
            ),
            values.hpi ?? "",
          );
          let complaintUuid = complaint?.uuid;
          let hasHpi = Boolean(complaint?.has_hpi || complaint?.hpi);

          if (!complaintUuid) {
            const created = await createComplaint.mutateAsync({
              text: nextText,
            });
            complaintUuid = created.uuid;
            hasHpi = false;
          } else if (nextText !== complaint?.text) {
            await updateComplaint.mutateAsync({
              complaintUuid,
              text: nextText,
            });
          }

          if (nextHpi && canWriteHpi) {
            await saveHpi.mutateAsync({
              complaintUuid,
              body: nextHpi,
              hasHpi,
            });
          }

          form.reset(defaultValuesFromComplaint(null));
          onSaved?.();
        })}
      >
        <div className="space-y-1.5">
          <Label htmlFor={`opd-chief-complaint-${complaint?.uuid ?? "new"}`}>
            Chief complaint <RequiredFieldMarker />
          </Label>
          <Input
            id={`opd-chief-complaint-${complaint?.uuid ?? "new"}`}
            placeholder="e.g. Cough"
            autoComplete="off"
            disabled={!canWriteComplaint}
            {...form.register("text")}
          />
          {form.formState.errors.text ? (
            <p className="text-sm text-destructive">
              {form.formState.errors.text.message}
            </p>
          ) : null}
          {canWriteComplaint && visibleSuggestions.length > 0 ? (
            <div
              className="flex flex-wrap items-center gap-1.5 pt-1"
              data-testid="opd-complaint-suggestions"
            >
              {visibleSuggestions.map((item) => (
                <button
                  key={item.text}
                  type="button"
                  className="rounded-md border border-dash-border bg-white px-2.5 py-1 text-left text-xs text-brand-navy hover:border-brand-primary hover:text-brand-primary"
                  onClick={() => applySuggestion(item.text)}
                >
                  {item.text}
                </button>
              ))}
              {hasMoreSuggestions ? (
                <button
                  type="button"
                  className="rounded-md px-2 py-1 text-xs font-medium text-brand-primary hover:underline"
                  onClick={() => setPastComplaintsOpen(true)}
                  data-testid="opd-complaint-suggestions-view-more"
                >
                  View more
                </button>
              ) : null}
            </div>
          ) : null}
          {recordedMeta ? (
            <p className="text-xs text-dash-muted">{recordedMeta}</p>
          ) : null}
        </div>

        {canWriteHpi || complaint?.hpi?.body ? (
          <div className="space-y-3" data-testid="opd-hpi-section">
            <OpdHpiDurationFields
              value={durationValue}
              unit={
                isHpiDurationUnit(durationUnit)
                  ? durationUnit
                  : DEFAULT_HPI_DURATION_UNIT
              }
              disabled={!canWriteHpi}
              onValueChange={(next) =>
                form.setValue("durationValue", next, { shouldDirty: true })
              }
              onUnitChange={(next) =>
                form.setValue("durationUnit", next, { shouldDirty: true })
              }
            />
            <div className="space-y-1.5">
              <Textarea
                id={`opd-hpi-${complaint?.uuid ?? "new"}`}
                rows={6}
                placeholder="Comment"
                disabled={!canWriteHpi}
                aria-label="Comment"
                {...form.register("hpi")}
              />
            </div>
          </div>
        ) : null}

        {showFooterActions ? (
          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save"}
            </Button>
            {complaint && canWriteComplaint && onDelete ? (
              <Button
                type="button"
                variant="ghost"
                className="h-9 px-0 text-destructive hover:bg-transparent hover:text-destructive"
                onClick={onDelete}
              >
                Delete
              </Button>
            ) : null}
          </div>
        ) : null}
      </form>

      <OpdPastComplaintsDialog
        open={pastComplaintsOpen}
        onOpenChange={setPastComplaintsOpen}
        suggestions={filteredSuggestions}
        onSelect={applySuggestion}
      />
    </>
  );
}
