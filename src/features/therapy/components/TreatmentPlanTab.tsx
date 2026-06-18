"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { SpinnerGlyph } from "@/components/loading-spinner";
import { SecondaryButton } from "@/components/ui/app-buttons";
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
import { TherapyFormActionBar } from "@/features/therapy/components/TherapyFormActionBar";
import { TreatmentPlanDetails } from "@/features/therapy/components/TreatmentPlanDetails";
import { TreatmentPlanTemplateSidebar } from "@/features/therapy/components/TreatmentPlanTemplateSidebar";
import {
  treatmentPlanSchema,
  type TreatmentPlanFormValues,
} from "@/features/therapy/schemas/treatment-goal.schema";
import { assignTherapyVisitTreatmentPlan } from "@/features/therapy/services/therapy.service";
import type {
  TherapyDiscipline,
  TherapyTreatmentPlan,
  TherapyVisitTreatmentGoals,
} from "@/features/therapy/types/therapy.types";
import { useToast } from "@/providers/toast-provider";

const EMPTY_VALUES: TreatmentPlanFormValues = {
  title: "",
  diagnosis: "",
  diagnosis_code: "",
  total_sessions_planned: 1,
  sessions_completed: 0,
  start_date: "",
  expected_end_date: "",
  actual_end_date: "",
};

function valuesFromTemplate(
  template: TherapyTreatmentPlan,
): TreatmentPlanFormValues {
  return {
    title: template.title,
    diagnosis: template.diagnosis,
    diagnosis_code: template.diagnosis_code,
    total_sessions_planned: template.total_sessions_planned,
    sessions_completed: 0,
    start_date: template.start_date ?? "",
    expected_end_date: template.expected_end_date ?? "",
    actual_end_date: template.actual_end_date ?? "",
  };
}

export function TreatmentPlanTab({
  discipline,
  visitUuid,
  data,
  onChanged,
  isReadOnly,
}: {
  discipline: TherapyDiscipline;
  visitUuid: string;
  data: TherapyVisitTreatmentGoals;
  onChanged: () => Promise<void>;
  isReadOnly: boolean;
}) {
  const { toast } = useToast();
  const [selectedPlanUuid, setSelectedPlanUuid] = useState("");
  const [isLinking, setIsLinking] = useState(false);
  const form = useForm<TreatmentPlanFormValues>({
    resolver: zodResolver(treatmentPlanSchema),
    defaultValues: EMPTY_VALUES,
  });

  async function handleSubmit(values: TreatmentPlanFormValues) {
    try {
      await assignTherapyVisitTreatmentPlan(discipline, visitUuid, {
        treatment_plan: {
          title: values.title.trim(),
          diagnosis: values.diagnosis.trim(),
          diagnosis_code: values.diagnosis_code.trim(),
          total_sessions_planned: values.total_sessions_planned,
          start_date: values.start_date || null,
          expected_end_date: values.expected_end_date || null,
          actual_end_date: values.actual_end_date || null,
        },
      });
      await onChanged();
      toast({
        variant: "success",
        title: "Treatment plan added",
        description: "The new plan is linked to this visit appointment.",
      });
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not add treatment plan",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
      });
    }
  }

  async function linkTreatmentPlan() {
    if (!selectedPlanUuid) return;
    setIsLinking(true);
    try {
      await assignTherapyVisitTreatmentPlan(discipline, visitUuid, {
        linked_treatment_plan_uuid: selectedPlanUuid,
      });
      await onChanged();
      toast({
        variant: "success",
        title: "Treatment plan linked",
        description: "The client's active plan is now linked to this visit.",
      });
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not link treatment plan",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
      });
    } finally {
      setIsLinking(false);
    }
  }

  if (data.treatment_plan) {
    return (
      <TreatmentPlanDetails
        plan={data.treatment_plan}
        discipline={discipline}
        visitUuid={visitUuid}
        isReadOnly={isReadOnly}
        onChanged={onChanged}
      />
    );
  }

  const isSubmitting = form.formState.isSubmitting;
  if (isReadOnly) {
    return (
      <div className="py-12 text-center">
        <h2 className="text-lg font-semibold text-brand-navy">
          Treatment plan unavailable
        </h2>
        <p className="mt-2 text-sm text-brand-muted">
          A treatment plan cannot be linked or created after this visit is
          completed.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-7 xl:grid-cols-[minmax(0,1fr)_17rem]">
      <div>
        <section className="mb-7 rounded-xl border border-brand-border bg-brand-surface p-4">
          <h2 className="font-semibold text-brand-navy">
            Link client treatment plan
          </h2>
          <p className="mt-1 text-sm text-brand-muted">
            Select an active treatment plan already belonging to this client.
          </p>
          {data.linkable_treatment_plans.length > 0 ? (
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <Select
                value={selectedPlanUuid}
                onValueChange={setSelectedPlanUuid}
              >
                <SelectTrigger className="sm:flex-1">
                  <SelectValue placeholder="Select active treatment plan" />
                </SelectTrigger>
                <SelectContent>
                  {data.linkable_treatment_plans.map((plan) => (
                    <SelectItem key={plan.uuid} value={plan.uuid}>
                      {plan.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <SecondaryButton
                type="button"
                disabled={!selectedPlanUuid || isLinking}
                onClick={() => void linkTreatmentPlan()}
              >
                {isLinking ? <SpinnerGlyph size="xs" /> : null}
                Link treatment plan
              </SecondaryButton>
            </div>
          ) : (
            <p className="mt-4 text-sm text-brand-muted">
              This client has no active treatment plans available to link.
            </p>
          )}
        </section>
        <h2 className="text-xl font-semibold text-brand-navy">
          Add treatment plan
        </h2>
        <p className="mt-1 text-sm text-brand-muted">
          Enter plan details or reuse values from a clinic template.
        </p>
        <Form {...form}>
          <form
            className="mt-6 space-y-4 pb-28"
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="diagnosis_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Diagnosis code</FormLabel>
                    <FormControl><Input maxLength={20} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="diagnosis"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Diagnosis</FormLabel>
                  <FormControl><Textarea rows={3} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              {(["total_sessions_planned", "sessions_completed"] as const).map(
                (name) => (
                  <FormField
                    key={name}
                    control={form.control}
                    name={name}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {name === "total_sessions_planned"
                            ? "Sessions planned"
                            : "Sessions completed"}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            disabled={name === "sessions_completed"}
                            {...field}
                            onChange={(event) =>
                              field.onChange(event.target.valueAsNumber)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ),
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {([
                ["start_date", "Start date"],
                ["expected_end_date", "Expected end date"],
              ] as const).map(([name, label]) => (
                <FormField
                  key={name}
                  control={form.control}
                  name={name}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{label}</FormLabel>
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
              ))}
            </div>
            <TherapyFormActionBar
              isSubmitting={isSubmitting}
              message="Treatment plan ready to add"
              saveLabel="Save treatment plan"
              onCancel={() => form.reset(EMPTY_VALUES)}
            />
          </form>
        </Form>
      </div>
      <TreatmentPlanTemplateSidebar
        templates={data.available_treatment_plans}
        onSelect={(template) => form.reset(valuesFromTemplate(template))}
      />
    </div>
  );
}
