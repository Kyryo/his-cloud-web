import { z } from "zod";

import { TOOTH_SURFACE_VALUES } from "@/features/clinical-dental/schemas/dental-finding.schema";
import type { DentalProcedurePayload } from "@/features/clinical-dental/types/clinical-dental.types";
import { todayDateInputValue } from "@/features/inventory/schemas/purchase-order.schema";

export const TREATMENT_DATE_FUTURE_MESSAGE = "Treatment date cannot be in the future.";
export const TREATMENT_PRODUCT_REQUIRED_MESSAGE = "Select the treatment or procedure.";

export const dentalTreatmentSchema = z.object({
  treatment_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Select the treatment date.")
    .refine((value) => value <= todayDateInputValue(), TREATMENT_DATE_FUTURE_MESSAGE),
  product_uuid: z.string().min(1, TREATMENT_PRODUCT_REQUIRED_MESSAGE),
  product_label: z.string(),
  tooth_numbers: z.array(z.number().int().positive()),
  surfaces: z.array(z.enum(TOOTH_SURFACE_VALUES)),
  notes: z.string().trim().max(4000),
});

export type DentalTreatmentFormValues = z.infer<typeof dentalTreatmentSchema>;

export function dentalTreatmentDefaultValues(): DentalTreatmentFormValues {
  return {
    treatment_date: todayDateInputValue(),
    product_uuid: "",
    product_label: "",
    tooth_numbers: [],
    surfaces: [],
    notes: "",
  };
}

export function toDentalTreatmentPayload(
  values: DentalTreatmentFormValues,
): DentalProcedurePayload {
  return {
    product_uuid: values.product_uuid,
    treatment_date: values.treatment_date,
    tooth_numbers: [...new Set(values.tooth_numbers)].sort((a, b) => a - b),
    surfaces: values.surfaces,
    notes: values.notes,
  };
}
