import { z } from "zod";

import { hasRichTextContent } from "@/features/clinical-opd/utils/rich-text";

export const nursingNoteSchema = z.object({
  body: z.string().trim().min(1, "Nursing note is required."),
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

export const prescriptionSchema = z.object({
  product_uuid: z.string().uuid(),
  dose: z.string().optional(),
  route: z.string().optional(),
  frequency: z.string().optional(),
  duration: z.string().optional(),
  quantity: z.coerce.number().positive(),
  instructions: z.string().optional(),
  is_prn: z.boolean().optional(),
  clinical_notes: z.string().optional(),
});

export const clinicalOrderSchema = z.object({
  item_type: z.string().min(1),
  description: z.string().optional(),
  quantity: z.coerce.number().positive().default(1),
  product_uuid: z.string().uuid().optional(),
});
