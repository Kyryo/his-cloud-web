import { z } from "zod";

export const REFERENCE_RANGE_SEX_OPTIONS = ["ANY", "M", "F"] as const;

export const referenceRangeSchema = z.object({
  analyte_uuid: z.string().trim().min(1, "Analyte is required."),
  specimen_type_uuid: z.string().trim().optional().or(z.literal("")),
  sex: z.enum(REFERENCE_RANGE_SEX_OPTIONS),
  age_min_days: z.string().trim().optional().or(z.literal("")),
  age_max_days: z.string().trim().optional().or(z.literal("")),
  low_normal: z.string().trim().optional().or(z.literal("")),
  high_normal: z.string().trim().optional().or(z.literal("")),
  low_critical: z.string().trim().optional().or(z.literal("")),
  high_critical: z.string().trim().optional().or(z.literal("")),
  effective_from: z.string().trim().min(1, "Effective from is required."),
  effective_to: z.string().trim().optional().or(z.literal("")),
  text_normal: z.string().trim().max(255).optional().or(z.literal("")),
});

export type ReferenceRangeFormValues = z.infer<typeof referenceRangeSchema>;

export const referenceRangeDefaultValues: ReferenceRangeFormValues = {
  analyte_uuid: "",
  specimen_type_uuid: "",
  sex: "ANY",
  age_min_days: "",
  age_max_days: "",
  low_normal: "",
  high_normal: "",
  low_critical: "",
  high_critical: "",
  effective_from: new Date().toISOString().slice(0, 10),
  effective_to: "",
  text_normal: "",
};
