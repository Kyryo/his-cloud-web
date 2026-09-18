import { z } from "zod";

import { hasRichTextContent } from "@/features/clinical-opd/utils/rich-text";

export const nursingNoteSchema = z.object({
  body: z.string().trim().min(1, "Nursing note is required."),
  amendment_reason: z.string().optional(),
});

export const clinicalNoteAmendSchema = z.object({
  body: z.string().trim().min(1, "Note is required."),
  amendment_reason: z.string().trim().min(1, "Amendment reason is required."),
});

export const chiefComplaintSchema = z.object({
  text: z.string().trim().min(1, "Chief complaint is required."),
});

export const hpiSchema = z.object({
  body: z.string().trim().min(1, "HPI is required."),
});

export const allergySchema = z.object({
  allergy_name: z.string().trim().min(1, "Allergy name is required."),
  allergy_type: z.string().trim().min(1, "Type is required."),
  severity: z.string().trim().min(1, "Severity is required."),
  reaction: z.string().optional(),
  notes: z.string().optional(),
  date_identified: z.string().optional(),
});

export const problemListSchema = z.object({
  description: z.string().trim().min(1, "Description is required."),
  code: z.string().optional(),
  standard: z.string().optional(),
  notes: z.string().optional(),
});

export const currentMedicationSchema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  product_uuid: z.string().optional(),
  dose: z.string().optional(),
  route: z.string().optional(),
  frequency: z.string().optional(),
  instructions: z.string().optional(),
  notes: z.string().optional(),
});

export type CurrentMedicationFormValues = z.infer<typeof currentMedicationSchema>;

export const dispositionSchema = z.object({
  outcome: z.enum(["discharged", "follow_up", "referred", "admitted", "other"]),
  follow_up_at: z.string().optional(),
  notes: z.string().optional(),
  referral_destination: z.string().optional(),
});

export const physicalExamSchema = z.object({
  section: z.enum(["general", "system", "free_text"]).default("general"),
  system_code: z.string().optional(),
  findings: z
    .string()
    .refine(hasRichTextContent, "Findings are required."),
});

export const clinicalNoteSchema = z.object({
  body: z.string().trim().min(1, "Clinical note is required."),
});

export const observationSchema = z.object({
  definition_uuid: z.string().uuid(),
  numeric_value: z.string().optional(),
  text_value: z.string().optional(),
  unit: z.string().optional(),
});

export const CLINICAL_ORDER_ITEM_TYPES = [
  "LABORATORY",
  "RADIOLOGY",
  "PROCEDURE",
  "SUNDRY",
  "MEDICATION",
] as const;

export type ClinicalOrderItemType = (typeof CLINICAL_ORDER_ITEM_TYPES)[number];

export const prescriptionSchema = z.object({
  product_uuid: z.string().uuid("Select a medication product."),
  dose: z.string().optional(),
  route: z.string().optional(),
  frequency: z.string().optional(),
  duration: z.string().optional(),
  clinical_quantity: z.coerce.number().positive("Amount prescribed is required."),
  clinical_uom: z.string().trim().min(1, "Unit of measure is required."),
  charge_quantity: z.coerce.number().positive("Units to charge is required."),
  instructions: z.string().optional(),
  is_prn: z.boolean().optional(),
  clinical_notes: z.string().optional(),
});

export type PrescriptionFormValues = z.infer<typeof prescriptionSchema>;

export const clinicalOrderSchema = z.object({
  item_type: z.enum(CLINICAL_ORDER_ITEM_TYPES, {
    message: "Select an order type.",
  }),
  description: z.string().optional(),
  product_uuid: z.string().uuid("Select a catalog product."),
  clinical_quantity: z.coerce.number().positive("Clinical quantity is required."),
  clinical_uom: z.string().trim().min(1, "Unit of measure is required."),
  charge_quantity: z.coerce.number().positive("Charge quantity is required."),
});

export type ClinicalOrderFormValues = z.infer<typeof clinicalOrderSchema>;

export const ENCOUNTER_BILLING_MODES = [
  "shared_visit",
  "separate_department",
] as const;

export type EncounterBillingMode = (typeof ENCOUNTER_BILLING_MODES)[number];

export const encounterBillingModeSchema = z.object({
  billing_mode: z.enum(ENCOUNTER_BILLING_MODES, {
    message: "Select a billing mode.",
  }),
});
