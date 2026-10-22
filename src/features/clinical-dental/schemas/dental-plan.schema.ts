import { z } from "zod";

import { TOOTH_SURFACE_VALUES } from "@/features/clinical-dental/schemas/dental-finding.schema";
import type {
  DentalPerformPayload,
  DentalPlanItemPayload,
  DentalProcedurePayload,
  DentalTreatmentPlanPayload,
} from "@/features/clinical-dental/types/clinical-dental.types";
import {
  getPermanentFdiToothNumbers,
  getPrimaryFdiToothNumbers,
} from "@/features/dental/lib/dental-dentition";

const FDI_TEETH = new Set([
  ...getPermanentFdiToothNumbers(),
  ...getPrimaryFdiToothNumbers(),
]);

/** Parse "36, 37 46" into sorted unique tooth numbers; null when invalid. */
export function parseToothList(value: string): number[] | null {
  const tokens = value.split(/[\s,;]+/).filter(Boolean);
  const teeth = new Set<number>();
  for (const token of tokens) {
    if (!/^\d{2}$/.test(token)) {
      return null;
    }
    const tooth = Number(token);
    if (!FDI_TEETH.has(tooth)) {
      return null;
    }
    teeth.add(tooth);
  }
  return [...teeth].sort((a, b) => a - b);
}

const toothListField = z
  .string()
  .trim()
  .refine(
    (value) => parseToothList(value) !== null,
    "Enter FDI tooth numbers such as 36, 37",
  );

const moneyField = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || /^\d+(\.\d{1,2})?$/.test(value),
    "Enter an amount such as 15000 or 15000.50",
  );

export const dentalPlanSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(255),
  notes: z.string().trim().max(4000),
});

export type DentalPlanFormValues = z.infer<typeof dentalPlanSchema>;

export const dentalPlanDefaultValues: DentalPlanFormValues = { title: "", notes: "" };

export function toDentalPlanPayload(
  values: DentalPlanFormValues,
): DentalTreatmentPlanPayload {
  return { title: values.title, notes: values.notes };
}

export const dentalProcedureSchema = z.object({
  product_uuid: z.string().min(1, "Select a procedure"),
  teeth: toothListField,
  surfaces: z.array(z.enum(TOOTH_SURFACE_VALUES)),
  estimated_price: moneyField,
  notes: z.string().trim().max(4000),
});

export type DentalProcedureFormValues = z.infer<typeof dentalProcedureSchema>;

export function dentalProcedureDefaultValues(
  teeth: readonly number[] = [],
): DentalProcedureFormValues {
  return {
    product_uuid: "",
    teeth: teeth.join(", "),
    surfaces: [],
    estimated_price: "",
    notes: "",
  };
}

export function toDentalPlanItemPayload(
  values: DentalProcedureFormValues,
): DentalPlanItemPayload {
  return {
    product_uuid: values.product_uuid,
    tooth_numbers: parseToothList(values.teeth) ?? [],
    surfaces: values.surfaces,
    estimated_price: values.estimated_price || null,
    notes: values.notes,
  };
}

export function toDentalProcedurePayload(
  values: DentalProcedureFormValues,
): DentalProcedurePayload {
  return {
    product_uuid: values.product_uuid,
    tooth_numbers: parseToothList(values.teeth) ?? [],
    surfaces: values.surfaces,
    notes: values.notes,
  };
}

export const dentalPerformSchema = z.object({
  notes: z.string().trim().max(4000),
  materials_used: z.string().trim().max(2000),
});

export type DentalPerformFormValues = z.infer<typeof dentalPerformSchema>;

export const dentalPerformDefaultValues: DentalPerformFormValues = {
  notes: "",
  materials_used: "",
};

export function toDentalPerformPayload(
  values: DentalPerformFormValues,
): DentalPerformPayload {
  return { notes: values.notes, materials_used: values.materials_used };
}
