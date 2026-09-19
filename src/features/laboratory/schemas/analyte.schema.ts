import { z } from "zod";

export const ANALYTE_VALUE_TYPES = ["NUMERIC", "TEXT", "CODED"] as const;

export const analyteSchema = z.object({
  code: z.string().trim().min(1, "Code is required.").max(64),
  name: z.string().trim().min(1, "Name is required.").max(255),
  loinc_code: z.string().trim().max(64).optional().or(z.literal("")),
  value_type: z.enum(ANALYTE_VALUE_TYPES),
  unit: z.string().trim().max(32).optional().or(z.literal("")),
  decimal_precision: z.string().trim().optional().or(z.literal("")),
});

export type AnalyteFormValues = z.infer<typeof analyteSchema>;

export const analyteDefaultValues: AnalyteFormValues = {
  code: "",
  name: "",
  loinc_code: "",
  value_type: "NUMERIC",
  unit: "",
  decimal_precision: "",
};
