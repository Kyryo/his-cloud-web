import { z } from "zod";

export const purchaseOrderLineBatchSchema = z.object({
  batch_number: z.string().trim().min(1, "Batch number is required."),
  expiry_date: z.string().trim().min(1, "Expiry date is required."),
  manufacture_date: z.string().trim().optional(),
  supplier: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

export type PurchaseOrderLineBatchFormValues = z.infer<typeof purchaseOrderLineBatchSchema>;

export function toPurchaseOrderLineBatchFormValues(
  values: Partial<PurchaseOrderLineBatchFormValues> = {},
): PurchaseOrderLineBatchFormValues {
  return {
    batch_number: values.batch_number ?? "",
    expiry_date: values.expiry_date ?? "",
    manufacture_date: values.manufacture_date ?? "",
    supplier: values.supplier ?? "",
    notes: values.notes ?? "",
  };
}
