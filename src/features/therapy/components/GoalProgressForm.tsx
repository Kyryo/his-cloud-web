"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { SpinnerGlyph } from "@/components/loading-spinner";
import {
  PrimaryButton,
  SecondaryButton,
} from "@/components/ui/app-buttons";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { recordTherapyGoalProgress } from "@/features/therapy/services/therapy.service";
import type {
  TherapyDiscipline,
  TherapyTreatmentGoal,
} from "@/features/therapy/types/therapy.types";
import { useToast } from "@/providers/toast-provider";

const progressSchema = z.object({
  measured_value: z.string(),
  boolean_response: z.enum(["", "yes", "no"]),
  notes: z.string(),
});

type ProgressFormValues = z.infer<typeof progressSchema>;

export function GoalProgressForm({
  discipline,
  visitUuid,
  goal,
  onCancel,
  onRecorded,
}: {
  discipline: TherapyDiscipline;
  visitUuid: string;
  goal: TherapyTreatmentGoal;
  onCancel: () => void;
  onRecorded: () => Promise<void>;
}) {
  const { toast } = useToast();
  const form = useForm<ProgressFormValues>({
    resolver: zodResolver(progressSchema),
    defaultValues: {
      measured_value: "",
      boolean_response: "",
      notes: "",
    },
  });
  const isSubmitting = form.formState.isSubmitting;

  async function handleSubmit(values: ProgressFormValues) {
    const isBooleanGoal = goal.unit === "boolean";
    if (isBooleanGoal && !values.boolean_response) {
      form.setError("boolean_response", {
        message: "Select Yes or No.",
      });
      return;
    }
    if (
      !isBooleanGoal &&
      (!values.measured_value || Number(values.measured_value) <= 0)
    ) {
      form.setError("measured_value", {
        message: "Progress must be greater than zero.",
      });
      return;
    }
    try {
      await recordTherapyGoalProgress(discipline, visitUuid, goal.uuid, {
        measured_value: isBooleanGoal ? undefined : values.measured_value,
        boolean_value: isBooleanGoal
          ? values.boolean_response === "yes"
          : undefined,
        notes: values.notes,
      });
      await onRecorded();
      onCancel();
      toast({
        variant: "success",
        title: "Progress recorded",
        description: "The treatment goal progress has been updated.",
      });
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not record progress",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
      });
    }
  }

  return (
    <Form {...form}>
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit(handleSubmit)}
      >
        {goal.unit === "boolean" ? (
          <FormField
            control={form.control}
            name="boolean_response"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Response</FormLabel>
                <FormControl>
                  <div className="flex gap-6">
                    {(["yes", "no"] as const).map((value) => (
                      <label
                        key={value}
                        className="flex cursor-pointer items-center gap-2 text-sm capitalize text-brand-slate"
                      >
                        <input
                          type="radio"
                          name={field.name}
                          value={value}
                          checked={field.value === value}
                          onChange={() => field.onChange(value)}
                          className="size-4 accent-brand-primary"
                        />
                        {value}
                      </label>
                    ))}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : (
        <FormField
          control={form.control}
          name="measured_value"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Progress value</FormLabel>
              <FormControl>
                <Input type="number" min="0.01" step="0.01" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        )}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea rows={2} placeholder="Optional notes" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2">
          <SecondaryButton
            type="button"
            size="sm"
            disabled={isSubmitting}
            onClick={onCancel}
          >
            Cancel
          </SecondaryButton>
          <PrimaryButton
            type="submit"
            size="sm"
            disabled={isSubmitting}
          >
            {isSubmitting ? <SpinnerGlyph size="xs" /> : null}
            Record
          </PrimaryButton>
        </div>
      </form>
    </Form>
  );
}
