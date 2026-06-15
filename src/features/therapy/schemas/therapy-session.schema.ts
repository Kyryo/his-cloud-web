import { format } from "date-fns";
import { z } from "zod";

export const therapySessionSchema = z.object({
  date: z.string().min(1, "Session date is required."),
  duration_minutes: z.number().int().min(1).max(1440),
  subjective_complaint: z.string().nullable(),
  objective_findings: z.string().nullable(),
  patient_response: z.enum([
    "",
    "excellent",
    "good",
    "fair",
    "poor",
    "deteriorated",
  ]).nullable(),
  assessment_notes: z.string(),
  plan_for_next_session: z.string().nullable(),
  is_final_session: z.boolean(),
});

export type TherapySessionFormValues = z.infer<typeof therapySessionSchema>;

export const therapySessionDefaultValues: TherapySessionFormValues = {
  date: format(new Date(), "yyyy-MM-dd"),
  duration_minutes: 30,
  subjective_complaint: null,
  objective_findings: null,
  patient_response: null,
  assessment_notes: "",
  plan_for_next_session: null,
  is_final_session: false,
};
