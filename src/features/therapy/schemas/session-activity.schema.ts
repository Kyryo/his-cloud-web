import { z } from "zod";

export const sessionActivitySchema = z.object({
  session_uuid: z.string().uuid("Select a therapy session."),
  name: z.string().trim().min(1, "Activity name is required."),
  category: z.string().trim().min(1, "Category is required."),
  description: z.string().trim().min(1, "Description is required."),
  instructions: z.string().trim().min(1, "Instructions are required."),
  precautions: z.string(),
  sets: z.number().int().positive().nullable(),
  reps: z.number().int().positive().nullable(),
  duration_seconds: z.number().int().positive().nullable(),
  resistance_or_level: z.string(),
  cues_provided: z.string(),
  performance_notes: z.string(),
  is_home_program: z.boolean(),
});

export type SessionActivityFormValues = z.infer<typeof sessionActivitySchema>;
