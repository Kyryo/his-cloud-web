"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Settings } from "lucide-react";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { SpinnerGlyph } from "@/components/loading-spinner";
import {
  PrimaryButton,
  SecondaryButton,
} from "@/components/ui/app-buttons";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
import { Textarea } from "@/components/ui/textarea";
import { TherapyDatePickerField } from "@/features/therapy/components/TherapyDatePickerField";
import {
  treatmentGoalDefaultValues,
  treatmentGoalSchema,
  type TreatmentGoalFormValues,
} from "@/features/therapy/schemas/treatment-goal.schema";
import { createTherapyVisitTreatmentGoal } from "@/features/therapy/services/therapy.service";
import type {
  TherapyDiscipline,
  TherapyGoalUnit,
} from "@/features/therapy/types/therapy.types";
import { useToast } from "@/providers/toast-provider";

const GOAL_UNITS: Array<{ value: TherapyGoalUnit; label: string }> = [
  { value: "numeric", label: "Numeric" },
  { value: "percentage", label: "Percentage" },
  { value: "degrees", label: "Degrees" },
  { value: "cm", label: "Centimeters" },
  { value: "meters", label: "Meters" },
  { value: "seconds", label: "Seconds" },
  { value: "repetitions", label: "Repetitions" },
  { value: "boolean", label: "Yes / No" },
  { value: "custom", label: "Custom" },
];

export function TreatmentGoalForm({
  discipline,
  visitUuid,
  onCancel,
  onCreated,
}: {
  discipline: TherapyDiscipline;
  visitUuid: string;
  onCancel: () => void;
  onCreated: () => Promise<void>;
}) {
  const { toast } = useToast();
  const [showMore, setShowMore] = useState(false);
  const form = useForm<TreatmentGoalFormValues>({
    resolver: zodResolver(treatmentGoalSchema),
    defaultValues: treatmentGoalDefaultValues,
  });
  const unit = useWatch({ control: form.control, name: "unit" });
  const isSubmitting = form.formState.isSubmitting;

  async function handleSubmit(values: TreatmentGoalFormValues) {
    try {
      await createTherapyVisitTreatmentGoal(discipline, visitUuid, {
        description: values.description.trim(),
        unit: values.unit,
        unit_custom_label: values.unit_custom_label.trim(),
        baseline_value: values.baseline_value || null,
        target_value: values.target_value || null,
        target_date: values.target_date || null,
        notes: values.notes.trim(),
      });
      await onCreated();
      form.reset(treatmentGoalDefaultValues);
      onCancel();
      toast({
        variant: "success",
        title: "Treatment goal added",
        description: "The goal was added to the appointment treatment plan.",
      });
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not add treatment goal",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
      });
    }
  }

  return (
    <Form {...form}>
      <form
        className="space-y-3 px-4 py-4 sm:px-5"
        onSubmit={form.handleSubmit(handleSubmit)}
      >
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Goal</FormLabel>
              <FormControl>
                <Input placeholder="Measurable goal" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="unit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unit</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {GOAL_UNITS.map((option) => (
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
        {unit === "custom" ? (
          <FormField
            control={form.control}
            name="unit_custom_label"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Custom unit</FormLabel>
                <FormControl>
                  <Input placeholder="Words per minute" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : null}
        {unit !== "boolean" ? (
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="baseline_value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Baseline</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="target_value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Target</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        ) : null}
        <Collapsible open={showMore} onOpenChange={setShowMore}>
          <CollapsibleTrigger asChild>
            <Button type="button" variant="ghost" size="sm" className="-ml-3">
              <Settings className="size-4" aria-hidden="true" />
              {showMore ? "Hide more options" : "Show more options"}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 border-t border-brand-border pt-3">
            <FormField
              control={form.control}
              name="target_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target date</FormLabel>
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
          </CollapsibleContent>
        </Collapsible>
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
            Save goal
          </PrimaryButton>
        </div>
      </form>
    </Form>
  );
}
