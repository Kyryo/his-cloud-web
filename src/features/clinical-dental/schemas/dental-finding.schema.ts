import { z } from "zod";

import type { DentalFindingPayload } from "@/features/clinical-dental/types/clinical-dental.types";
import {
  getPermanentFdiToothNumbers,
  getPrimaryFdiToothNumbers,
} from "@/features/dental/lib/dental-dentition";

const FDI_TEETH = new Set([
  ...getPermanentFdiToothNumbers(),
  ...getPrimaryFdiToothNumbers(),
]);

export const DENTAL_CONDITION_VALUES = [
  "caries",
  "restoration",
  "crown",
  "missing",
  "extracted",
  "implant",
  "root_canal",
  "fracture",
  "bridge",
  "sealant",
  "mobility",
  "watch",
] as const;

export const TOOTH_SURFACE_VALUES = ["M", "O", "D", "B", "L", "I"] as const;

export const dentalFindingSchema = z.object({
  tooth_number: z
    .number()
    .int()
    .refine((value) => FDI_TEETH.has(value), "Select a valid FDI tooth"),
  condition: z.enum(DENTAL_CONDITION_VALUES, {
    message: "Select a condition",
  }),
  surfaces: z.array(z.enum(TOOTH_SURFACE_VALUES)),
  notes: z.string().trim().max(2000, "Notes must be 2000 characters or fewer"),
});

export type DentalFindingFormValues = z.infer<typeof dentalFindingSchema>;

export function dentalFindingDefaultValues(
  toothNumber: number,
): DentalFindingFormValues {
  return { tooth_number: toothNumber, condition: "caries", surfaces: [], notes: "" };
}

export function toDentalFindingPayload(
  values: DentalFindingFormValues,
): DentalFindingPayload {
  return {
    tooth_number: values.tooth_number,
    condition: values.condition,
    surfaces: values.surfaces,
    notes: values.notes,
  };
}
