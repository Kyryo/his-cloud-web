import { z } from "zod";

export const specimenTypeSchema = z.object({
  code: z.string().trim().min(1, "Code is required.").max(64),
  name: z.string().trim().min(1, "Name is required.").max(255),
  container: z.string().trim().max(128).optional().or(z.literal("")),
  volume: z.string().trim().optional().or(z.literal("")),
  volume_unit: z.string().trim().max(32).optional().or(z.literal("")),
  handling_notes: z.string().trim().optional().or(z.literal("")),
});

export type SpecimenTypeFormValues = z.infer<typeof specimenTypeSchema>;

export const specimenTypeDefaultValues: SpecimenTypeFormValues = {
  code: "",
  name: "",
  container: "",
  volume: "",
  volume_unit: "",
  handling_notes: "",
};
