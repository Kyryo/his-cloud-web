"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SessionClinicalNotesFields } from "@/features/therapy/components/SessionClinicalNotesFields";
import { TherapyFormActionBar } from "@/features/therapy/components/TherapyFormActionBar";
import { TherapyDatePickerField } from "@/features/therapy/components/TherapyDatePickerField";
import {
  therapySessionDefaultValues,
  therapySessionSchema,
  type TherapySessionFormValues,
} from "@/features/therapy/schemas/therapy-session.schema";
import {
  createTherapyVisitSession,
  updateTherapyVisitSession,
} from "@/features/therapy/services/therapy.service";
import type {
  TherapyDiscipline,
  TherapySession,
  TherapySessionPayload,
} from "@/features/therapy/types/therapy.types";
import { useToast } from "@/providers/toast-provider";

const RESPONSE_OPTIONS = [
  { value: "excellent", label: "Excellent" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
  { value: "poor", label: "Poor" },
  { value: "deteriorated", label: "Deteriorated" },
] as const;

export function TherapySessionForm({
  discipline,
  visitUuid,
  session,
  onCancel,
  onSaved,
}: {
  discipline: TherapyDiscipline;
  visitUuid: string;
  session: TherapySession | null;
  onCancel: () => void;
  onSaved: () => Promise<void>;
}) {
  const { toast } = useToast();
  const form = useForm<TherapySessionFormValues>({
    resolver: zodResolver(therapySessionSchema),
    defaultValues: session
      ? {
          date: session.date,
          duration_minutes: session.duration_minutes,
          subjective_complaint: session.subjective_complaint,
          objective_findings: session.objective_findings,
          patient_response: session.patient_response,
          assessment_notes: session.assessment_notes,
          plan_for_next_session: session.plan_for_next_session,
          is_final_session: session.is_final_session,
        }
      : therapySessionDefaultValues,
  });
  const isSubmitting = form.formState.isSubmitting;

  async function handleSubmit(values: TherapySessionFormValues) {
    try {
      const payload: TherapySessionPayload = {
        ...values,
        subjective_complaint: values.subjective_complaint || null,
        objective_findings: values.objective_findings || null,
        patient_response: values.patient_response || null,
        plan_for_next_session: values.plan_for_next_session || null,
      };
      if (session) {
        await updateTherapyVisitSession(
          discipline,
          visitUuid,
          session.uuid,
          payload,
        );
      } else {
        await createTherapyVisitSession(discipline, visitUuid, payload);
      }
      await onSaved();
      toast({
        variant: "success",
        title: session ? "Session updated" : "Session recorded",
        description: session
          ? "The therapy session changes were saved."
          : "The therapy session was added to the treatment plan.",
      });
    } catch (error) {
      toast({
        variant: "error",
        title: session ? "Could not update session" : "Could not record session",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
      });
    }
  }

  return (
    <Form {...form}>
      <form
        className="pb-28"
        onSubmit={form.handleSubmit(handleSubmit)}
      >
        <header className="mb-7 flex flex-wrap items-start justify-between gap-4 border-b border-brand-border pb-5">
          <div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="-ml-3 mb-2"
              disabled={isSubmitting}
              onClick={onCancel}
            >
              <ArrowLeft className="size-4" />
              Back to sessions
            </Button>
            <h2 className="text-xl font-semibold text-brand-navy">
              {session ? `Edit session ${session.session_number}` : "Record therapy session"}
            </h2>
            <p className="mt-1 text-sm text-brand-muted">
              Document today&apos;s intervention, findings, and next steps.
            </p>
          </div>
        </header>

        <div className="mb-7 grid gap-4 sm:grid-cols-3">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Session date</FormLabel>
                <FormControl>
                  <TherapyDatePickerField
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="duration_minutes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duration (minutes)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    max={1440}
                    disabled={isSubmitting}
                    {...field}
                    onChange={(event) => field.onChange(event.target.valueAsNumber)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="patient_response"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Client response</FormLabel>
                <Select
                  value={field.value ?? undefined}
                  onValueChange={(value) => field.onChange(value || null)}
                  disabled={isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select response" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {RESPONSE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <SessionClinicalNotesFields
          control={form.control}
          disabled={isSubmitting}
        />

        <TherapyFormActionBar
          isSubmitting={isSubmitting}
          message={
            session ? "Unsaved session changes" : "New session not yet saved"
          }
          saveLabel={session ? "Save changes" : "Save session"}
          onCancel={onCancel}
        />
      </form>
    </Form>
  );
}
