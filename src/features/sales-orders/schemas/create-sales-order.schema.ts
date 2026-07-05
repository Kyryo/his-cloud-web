import { z } from "zod";

export const createSalesOrderSchema = z.object({
  clientOrderRef: z.string().trim().max(255, "Reference is too long"),
  note: z.string().trim().max(1000, "Notes are too long"),
  providerId: z.number().int().positive().optional().nullable(),
});

export type CreateSalesOrderFormValues = z.infer<typeof createSalesOrderSchema>;

export const createSalesOrderDefaultValues: CreateSalesOrderFormValues = {
  clientOrderRef: "",
  note: "",
  providerId: null,
};

export function toCreateSalesOrderPayload(input: {
  customerId: number;
  clinicId?: number | null;
  clinicName?: string | null;
  visitId?: number | null;
  pricelistId?: number | null;
  values: CreateSalesOrderFormValues;
  providerId?: number | null;
}) {
  return {
    customer_id: input.customerId,
    visit_id: input.visitId ?? undefined,
    pricelist_id: input.pricelistId ?? undefined,
    clinic_id: input.clinicId ?? undefined,
    clinic_name: input.clinicName ?? undefined,
    provider_id: input.providerId ?? input.values.providerId ?? undefined,
    client_order_ref: input.values.clientOrderRef || undefined,
    note: input.values.note || undefined,
  };
}
