import { z } from "zod";

export const createBatchSchema = z.object({
  product_uuid: z.string().trim().min(1, "Product is required."),
  batch_number: z.string().trim().min(1, "Batch number is required."),
  supplier: z.string().trim().min(1, "Supplier is required."),
  expiry_date: z.string().optional(),
  manufacture_date: z.string().optional(),
  notes: z.string().optional(),
});

export type CreateBatchFormValues = z.infer<typeof createBatchSchema>;

export function createBatchDefaultValues(): CreateBatchFormValues {
  return {
    product_uuid: "",
    batch_number: "",
    supplier: "",
    expiry_date: "",
    manufacture_date: "",
    notes: "",
  };
}

export function toCreateBatchPayload(
  values: CreateBatchFormValues,
  tenantId: number,
) {
  return {
    tenant: tenantId,
    product_uuid: values.product_uuid,
    batch_number: values.batch_number.trim(),
    expiry_date: values.expiry_date?.trim() || null,
    manufacture_date: values.manufacture_date?.trim() || null,
    supplier: values.supplier.trim(),
    notes: values.notes?.trim() || null,
  };
}
