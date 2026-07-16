import { z } from "zod";

import type { PurchaseOrder } from "@/features/inventory/types/inventory.types";

export const PURCHASE_ORDER_DELIVERY_DATE_FUTURE_MESSAGE =
  "Delivery date cannot be in the future.";

/** Today's date formatted for a native date input, in the user's timezone. */
export function todayDateInputValue(): string {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 10);
}

function isFutureDate(value: string): boolean {
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return parsed > today;
}

export const updatePurchaseOrderSchema = z.object({
  vendor_name: z.string().trim().min(1, "Vendor name is required."),
  receiving_location: z.coerce.number().int().positive("Receiving location is required."),
  lpo_number: z.string().trim().optional(),
  grn_number: z.string().trim().optional(),
  delivery_date: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || !isFutureDate(value), {
      message: PURCHASE_ORDER_DELIVERY_DATE_FUTURE_MESSAGE,
    }),
  invoice_number: z.string().trim().optional(),
  invoice_date: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

export type UpdatePurchaseOrderFormValues = z.infer<typeof updatePurchaseOrderSchema>;

export const purchaseOrderDetailsStepFields = [
  "vendor_name",
  "receiving_location",
  "delivery_date",
] as const satisfies ReadonlyArray<keyof UpdatePurchaseOrderFormValues>;

export const purchaseOrderReferencesStepFields = [
  "lpo_number",
  "grn_number",
  "invoice_number",
  "invoice_date",
  "notes",
] as const satisfies ReadonlyArray<keyof UpdatePurchaseOrderFormValues>;

export const purchaseOrderDetailsStepSchema = updatePurchaseOrderSchema.pick({
  vendor_name: true,
  receiving_location: true,
  delivery_date: true,
});

export function countPurchaseOrderStepErrors(
  errors: Partial<Record<keyof UpdatePurchaseOrderFormValues, unknown>>,
  fields: ReadonlyArray<keyof UpdatePurchaseOrderFormValues>,
): number {
  return fields.filter((field) => Boolean(errors[field])).length;
}

export function resolvePurchaseOrderErrorStep(
  errors: Partial<Record<keyof UpdatePurchaseOrderFormValues, unknown>>,
): "details" | "references" {
  if (countPurchaseOrderStepErrors(errors, purchaseOrderDetailsStepFields) > 0) {
    return "details";
  }

  if (countPurchaseOrderStepErrors(errors, purchaseOrderReferencesStepFields) > 0) {
    return "references";
  }

  return "details";
}

export function toUpdatePurchaseOrderFormValues(
  order: PurchaseOrder,
): UpdatePurchaseOrderFormValues {
  return {
    vendor_name: order.vendor_name,
    receiving_location: order.receiving_location,
    lpo_number: order.lpo_number ?? "",
    grn_number: order.grn_number ?? "",
    delivery_date: order.delivery_date ?? "",
    invoice_number: order.invoice_number ?? "",
    invoice_date: order.invoice_date ?? "",
    notes: order.notes ?? "",
  };
}

export function toUpdatePurchaseOrderPayload(values: UpdatePurchaseOrderFormValues) {
  return {
    vendor_name: values.vendor_name.trim(),
    receiving_location: values.receiving_location,
    lpo_number: values.lpo_number?.trim() || null,
    grn_number: values.grn_number?.trim() || null,
    delivery_date: values.delivery_date?.trim() || null,
    invoice_number: values.invoice_number?.trim() || null,
    invoice_date: values.invoice_date?.trim() || null,
    notes: values.notes?.trim() || null,
  };
}

export function createPurchaseOrderDefaultValues(): UpdatePurchaseOrderFormValues {
  return {
    vendor_name: "",
    receiving_location: 0,
    lpo_number: "",
    grn_number: "",
    delivery_date: "",
    invoice_number: "",
    invoice_date: "",
    notes: "",
  };
}

export function toCreatePurchaseOrderPayload(values: UpdatePurchaseOrderFormValues) {
  return {
    ...toUpdatePurchaseOrderPayload(values),
    lines: [],
  };
}
