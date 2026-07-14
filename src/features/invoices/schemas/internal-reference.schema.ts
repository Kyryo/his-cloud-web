import { z } from "zod";

export const updateInvoiceInternalReferenceSchema = z.object({
  internal_reference: z
    .string()
    .trim()
    .max(2000, "Internal reference is too long"),
});

export type UpdateInvoiceInternalReferenceFormValues = z.infer<
  typeof updateInvoiceInternalReferenceSchema
>;
