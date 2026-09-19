"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RequiredFieldMarker } from "@/components/ui/required-field-marker";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateChiefComplaint,
  useSaveChiefComplaintHpi,
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
};

export function OpdComplaintComposer({
  visitUuid,
  encounterUuid,
  canWriteComplaint,
  canWriteHpi,
}: OpdComplaintComposerProps) {
  const createComplaint = useCreateChiefComplaint(visitUuid, encounterUuid);
  const saveHpi = useSaveChiefComplaintHpi(visitUuid, encounterUuid);
  const form = useForm({
    resolver: zodResolver(complaintWithHpiSchema),
    defaultValues: { text: "", hpi: "" },
  });

  if (!canWriteComplaint) {
    return null;
  }

  return (
    <form
      className="space-y-3"
      data-testid="opd-complaint-composer"
      onSubmit={form.handleSubmit(async (values) => {
        const complaint = await createComplaint.mutateAsync({
          text: values.text,
        });
        const hpi = values.hpi?.trim();
        if (hpi && canWriteHpi) {
          await saveHpi.mutateAsync({
            complaintUuid: complaint.uuid,
            body: hpi,
            hasHpi: false,
          });
        }
        form.reset({ text: "", hpi: "" });
      })}
    >
      <div className="space-y-1.5">
        <Label htmlFor="opd-chief-complaint">
          Chief complaint <RequiredFieldMarker />
        </Label>
        <Input
          id="opd-chief-complaint"
          placeholder="e.g. Cough for 3 days"
          autoComplete="off"
          {...form.register("text")}
        />
        {form.formState.errors.text ? (
          <p className="text-sm text-destructive">
            {form.formState.errors.text.message}
          </p>
        ) : null}
      </div>

      {canWriteHpi ? (
        <div className="space-y-1.5">
          <Label htmlFor="opd-hpi">History of present illness</Label>
          <Textarea
            id="opd-hpi"
            rows={4}
            placeholder="Onset, duration, associated symptoms, what makes it better or worse"
            {...form.register("hpi")}
          />
        </div>
      ) : null}

      <Button
        type="submit"
        disabled={createComplaint.isPending || saveHpi.isPending}
      >
        {createComplaint.isPending || saveHpi.isPending
          ? "Saving..."
          : "Save complaint"}
      </Button>
    </form>
  );
}

type OpdComplaintHpiFieldProps = {
  visitUuid: string;
  encounterUuid: string;
  complaint: ChiefComplaint;
  canWrite: boolean;
};

export function OpdComplaintHpiField({
  visitUuid,
  encounterUuid,
  complaint,
  canWrite,
}: OpdComplaintHpiFieldProps) {
  const saveHpi = useSaveChiefComplaintHpi(visitUuid, encounterUuid);
  const [body, setBody] = useState(complaint.hpi?.body ?? "");
  const recordedMeta = [
    formatDisplayDateTime(complaint.recorded_at),
    complaint.recorded_by_name,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <article
      className="space-y-3 border-t border-dash-border/70 pt-4 first:border-t-0 first:pt-0"
      data-testid={`opd-complaint-item-${complaint.uuid}`}
    >
      <div>
        <p className="text-sm font-medium text-brand-navy">{complaint.text}</p>
        {recordedMeta ? (
          <p className="mt-0.5 text-xs text-dash-muted">{recordedMeta}</p>
        ) : null}
      </div>

      {canWrite ? (
        <form
          className="space-y-3"
          onSubmit={async (event) => {
            event.preventDefault();
            const nextBody = body.trim();
            if (!nextBody) {
              return;
            }
            await saveHpi.mutateAsync({
              complaintUuid: complaint.uuid,
              body: nextBody,
              hasHpi: Boolean(complaint.has_hpi || complaint.hpi),
            });
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor={`opd-hpi-${complaint.uuid}`}>
              History of present illness <RequiredFieldMarker />
            </Label>
            <Textarea
              id={`opd-hpi-${complaint.uuid}`}
              rows={4}
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder="Onset, duration, associated symptoms"
            />
          </div>
          <Button type="submit" disabled={saveHpi.isPending || !body.trim()}>
            {saveHpi.isPending ? "Saving..." : "Save HPI"}
          </Button>
        </form>
      ) : complaint.hpi?.body ? (
        <p className="whitespace-pre-wrap text-sm text-brand-slate">
          {complaint.hpi.body}
        </p>
      ) : (
        <p className="text-sm text-dash-muted">No HPI yet</p>
      )}
    </article>
  );
}
