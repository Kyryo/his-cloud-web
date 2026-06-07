import { z } from "zod";

import type { CustomerNote } from "@/features/customers/types/customer-note.types";
import type { CustomerNoteType } from "@/features/customers/types/customer-note.types";

const noteTypeSchema = z.enum([
  "GENERAL",
  "CLINICAL",
  "BILLING",
  "ADMINISTRATIVE",
  "OTHER",
]) satisfies z.ZodType<CustomerNoteType>;

export const createCustomerNoteSchema = z.object({
  note_type: noteTypeSchema,
  title: z.string().trim().max(255, "Title cannot exceed 255 characters."),
  body: z.string().trim().min(1, "Note body is required."),
  is_pinned: z.boolean(),
});

export const updateCustomerNoteSchema = createCustomerNoteSchema.extend({
  is_active: z.boolean(),
});

export type CreateCustomerNoteFormValues = z.infer<typeof createCustomerNoteSchema>;
export type UpdateCustomerNoteFormValues = z.infer<typeof updateCustomerNoteSchema>;

export const createCustomerNoteDefaultValues: CreateCustomerNoteFormValues = {
  note_type: "GENERAL",
  title: "",
  body: "",
  is_pinned: false,
};

export function toCustomerNotePayload(
  customerId: number,
  values: CreateCustomerNoteFormValues,
) {
  return {
    customer: customerId,
    note_type: values.note_type,
    title: values.title.trim(),
    body: values.body.trim(),
    is_pinned: values.is_pinned,
    is_active: true,
  };
}

export function toUpdateCustomerNoteFormValues(
  note: CustomerNote,
): UpdateCustomerNoteFormValues {
  return {
    note_type: note.note_type,
    title: note.title ?? "",
    body: note.body,
    is_pinned: note.is_pinned,
    is_active: note.is_active,
  };
}

export function toUpdateCustomerNotePayload(values: UpdateCustomerNoteFormValues) {
  return {
    note_type: values.note_type,
    title: values.title.trim(),
    body: values.body.trim(),
    is_pinned: values.is_pinned,
    is_active: values.is_active,
  };
}
