"use client";

import { useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RequiredFieldMarker } from "@/components/ui/required-field-marker";
import { Textarea } from "@/components/ui/textarea";
import {
  useChiefComplaintSuggestions,
  useCreateChiefComplaint,
  useSaveChiefComplaintHpi,
  useUpdateChiefComplaint,
} from "@/features/clinical-opd/hooks/use-clinical-opd";
import { chiefComplaintSchema } from "@/features/clinical-opd/schemas/clinical-opd.schema";
import type { ChiefComplaint } from "@/features/clinical-opd/types/clinical-opd.types";
import { formatDisplayDateTime } from "@/features/customers/utils/format-customer";

const complaintWithHpiSchema = chiefComplaintSchema.extend({
  hpi: z.string().optional(),
});

type OpdComplaintComposerProps = {
  visitUuid: string;
  encounterUuid: string;
  canWriteComplaint: boolean;
  canWriteHpi: boolean;
  complaint?: ChiefComplaint | null;
  onDelete?: () => void;
};

export function OpdComplaintComposer({
  visitUuid,
  encounterUuid,
  canWriteComplaint,
  canWriteHpi,
  complaint = null,
  onDelete,
}: OpdComplaintComposerProps) {
  return (
    <OpdComplaintComposerForm
      key={complaint?.uuid ?? "new"}
      visitUuid={visitUuid}
      encounterUuid={encounterUuid}
      canWriteComplaint={canWriteComplaint}
      canWriteHpi={canWriteHpi}
      complaint={complaint}
      onDelete={onDelete}
    />
  );
}

function OpdComplaintComposerForm({
  visitUuid,
  encounterUuid,
  canWriteComplaint,
  canWriteHpi,
  complaint,
  onDelete,
}: OpdComplaintComposerProps) {
  const createComplaint = useCreateChiefComplaint(visitUuid, encounterUuid);
  const updateComplaint = useUpdateChiefComplaint(visitUuid, encounterUuid);
  const saveHpi = useSaveChiefComplaintHpi(visitUuid, encounterUuid);
  const suggestionsQuery = useChiefComplaintSuggestions(
    visitUuid,
    encounterUuid,
    canWriteComplaint,
  );
  const form = useForm({
    resolver: zodResolver(complaintWithHpiSchema),
    defaultValues: {
      text: complaint?.text ?? "",
      hpi: complaint?.hpi?.body ?? "",
    },
  });
  const textValue = useWatch({ control: form.control, name: "text" }) ?? "";
  const isSaving =
    createComplaint.isPending ||
    updateComplaint.isPending ||
    saveHpi.isPending;
  const recordedMeta = complaint
    ? [formatDisplayDateTime(complaint.recorded_at), complaint.recorded_by_name]
        .filter(Boolean)
        .join(" · ")
    : "";

  const suggestionChips = useMemo(() => {
    const query = textValue.trim().toLowerCase();
    return (suggestionsQuery.data ?? [])
      .filter((item) => {
        if (item.text.trim().toLowerCase() === query) {
          return false;
        }
        return !query || item.text.toLowerCase().includes(query);
      })
      .slice(0, 6);
  }, [suggestionsQuery.data, textValue]);

  const canEdit = canWriteComplaint || (Boolean(complaint) && canWriteHpi);

  if (!canEdit && !complaint) {
    return null;
  }

  if (!canEdit && complaint) {
    return (
      <article
        className="space-y-2"
        data-testid={`opd-complaint-item-${complaint.uuid}`}
      >
        <div>
          <p className="text-sm font-medium text-brand-navy">{complaint.text}</p>
          {recordedMeta ? (
            <p className="mt-0.5 text-xs text-dash-muted">{recordedMeta}</p>
          ) : null}
        </div>
        {complaint.hpi?.body ? (
          <p className="whitespace-pre-wrap text-sm text-brand-slate">
            {complaint.hpi.body}
          </p>
        ) : (
          <p className="text-sm text-dash-muted">No HPI yet</p>
        )}
      </article>
    );
  }

  return (
    <form
      className="space-y-4"
      data-testid="opd-complaint-composer"
      onSubmit={form.handleSubmit(async (values) => {
        const nextText = values.text.trim();
        const nextHpi = values.hpi?.trim() ?? "";
        let complaintUuid = complaint?.uuid;
        let hasHpi = Boolean(complaint?.has_hpi || complaint?.hpi);

        if (!complaintUuid) {
          const created = await createComplaint.mutateAsync({ text: nextText });
          complaintUuid = created.uuid;
          hasHpi = false;
        } else if (nextText !== complaint.text) {
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
      })}
    >
      <div className="space-y-1.5">
        <Label htmlFor={`opd-chief-complaint-${complaint?.uuid ?? "new"}`}>
          Chief complaint <RequiredFieldMarker />
        </Label>
        <Input
          id={`opd-chief-complaint-${complaint?.uuid ?? "new"}`}
          placeholder="e.g. Cough for 3 days"
          autoComplete="off"
          disabled={!canWriteComplaint}
          className="h-auto rounded-none border-0 border-b border-dash-border px-0 py-2 text-lg font-medium shadow-none focus-visible:ring-0"
          {...form.register("text")}
        />
        {form.formState.errors.text ? (
          <p className="text-sm text-destructive">
            {form.formState.errors.text.message}
          </p>
        ) : null}
        {canWriteComplaint && suggestionChips.length > 0 ? (
          <div
            className="flex flex-wrap gap-1.5 pt-1"
            data-testid="opd-complaint-suggestions"
          >
            {suggestionChips.map((item) => (
              <button
                key={item.text}
                type="button"
                className="rounded-md border border-dash-border bg-white px-2.5 py-1 text-left text-xs text-brand-navy hover:border-brand-primary hover:text-brand-primary"
                onClick={() => {
                  form.setValue("text", item.text, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }}
              >
                {item.text}
              </button>
            ))}
          </div>
        ) : null}
        {recordedMeta ? (
          <p className="text-xs text-dash-muted">{recordedMeta}</p>
        ) : null}
      </div>

      {canWriteHpi || complaint?.hpi?.body ? (
        <div className="space-y-1.5">
          <Label htmlFor={`opd-hpi-${complaint?.uuid ?? "new"}`}>
            History of present illness
          </Label>
          <Textarea
            id={`opd-hpi-${complaint?.uuid ?? "new"}`}
            rows={6}
            placeholder="Onset, duration, associated symptoms, what makes it better or worse"
            disabled={!canWriteHpi}
            className="resize-y rounded-none border-0 border-b border-dash-border px-0 shadow-none focus-visible:ring-0"
            {...form.register("hpi")}
          />
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : complaint ? "Save" : "Save complaint"}
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
    </form>
  );
}
