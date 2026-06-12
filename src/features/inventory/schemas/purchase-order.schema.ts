import { z } from "zod";

import type { PurchaseOrder } from "@/features/inventory/types/inventory.types";

export const updatePurchaseOrderSchema = z.object({
  vendor_name: z.string().trim().min(1, "Vendor name is required."),
  receiving_location: z.coerce.number().int().positive("Receiving location is required."),
  lpo_number: z.string().trim().optional(),
  grn_number: z.string().trim().optional(),
  delivery_date: z.string().trim().optional(),
  invoice_number: z.string().trim().optional(),
  invoice_date: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

export type UpdatePurchaseOrderFormValues = z.infer<typeof updatePurchaseOrderSchema>;

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
