import { z } from "zod";

import {
  toSectionCode,
  toUpperCode,
} from "@/features/oh-template-builder/lib/templateCodes";

const name = z
  .string()
  .trim()
  .min(1, "Name is required")
  .max(120, "Keep the name under 120 characters");

const upperCode = z
  .string()
  .trim()
  .max(64, "Keep the code under 64 characters")
  .refine((value) => toUpperCode(value).length > 0, "Code is required")
  .transform(toUpperCode);

export const templateFormSchema = z.object({
  name,
  code: upperCode,
});

export const sectionFormSchema = z.object({
  name,
  isMandatory: z.boolean(),
  selectionMode: z.enum(["exclusive", "inclusive"]),
});

export const newSectionFormSchema = sectionFormSchema.extend({
  code: z
    .string()
    .trim()
    .max(64, "Keep the code under 64 characters")
    .refine((value) => toSectionCode(value).length > 0, "Code is required")
    .transform(toSectionCode),
});

export const itemFormSchema = z.object({
  name: z.string().trim().max(160, "Keep the name under 160 characters"),
  code: upperCode,
  isMandatory: z.boolean(),
  schedule: z.array(
    z.object({
      interval: z
        .number({ invalid_type_error: "Enter a number" })
        .int("Whole numbers only")
        .min(1, "At least 1")
        .max(999, "Too large"),
      unit: z.enum(["day", "week", "month", "year"]),
      notes: z.string().trim().max(200, "Keep notes short"),
    }),
  ),
  responses: z.array(
    z.object({
      label: z.string().trim().min(1, "Label is required").max(80),
      code: z.string().trim().max(64),
    }),
  ),
});

export type TemplateFormInput = z.input<typeof templateFormSchema>;
export type TemplateFormValues = z.output<typeof templateFormSchema>;
export type SectionFormValues = z.infer<typeof sectionFormSchema>;
export type NewSectionFormInput = z.input<typeof newSectionFormSchema>;
export type NewSectionFormValues = z.output<typeof newSectionFormSchema>;
export type ItemFormInput = z.input<typeof itemFormSchema>;
export type ItemFormValues = z.output<typeof itemFormSchema>;
