import { z } from "zod";

export const treatmentGoalSchema = z.object({
  description: z.string().trim().min(1, "Goal description is required."),
  unit: z.enum([
    "degrees",
    "cm",
    "meters",
    "seconds",
    "repetitions",
    "numeric",
    "percentage",
    "boolean",
    "custom",
  ]),
  unit_custom_label: z.string(),
  baseline_value: z.string(),
  target_value: z.string(),
  target_date: z.string(),
  notes: z.string(),
});

export type TreatmentGoalFormValues = z.infer<typeof treatmentGoalSchema>;

export const treatmentGoalDefaultValues: TreatmentGoalFormValues = {
  description: "",
  unit: "numeric",
  unit_custom_label: "",
  baseline_value: "",
  target_value: "",
  target_date: "",
  notes: "",
};

export const treatmentPlanSchema = z.object({
  title: z.string().trim().min(1, "Plan title is required."),
  diagnosis: z.string().trim().min(1, "Diagnosis is required."),
  diagnosis_code: z.string().trim().max(20),
  total_sessions_planned: z.number().int().min(1).max(999),
  sessions_completed: z.number().int().min(0),
  start_date: z.string(),
  expected_end_date: z.string(),
  actual_end_date: z.string(),
});

export type TreatmentPlanFormValues = z.infer<typeof treatmentPlanSchema>;
