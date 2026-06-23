import { z } from "zod";

import type { StockAdjustment } from "@/features/inventory/types/inventory.types";

export const createStockAdjustmentSchema = z.object({
  location: z.coerce.number().int().positive("Location is required."),
  adjustment_type: z.enum(["QUANTITY", "COST"]),
  reason: z.string().trim().optional(),
});

export type CreateStockAdjustmentFormValues = z.infer<typeof createStockAdjustmentSchema>;

export function createStockAdjustmentDefaultValues(): CreateStockAdjustmentFormValues {
  return {
    location: 0,
    adjustment_type: "QUANTITY",
    reason: "",
  };
}

export function toCreateStockAdjustmentPayload(values: CreateStockAdjustmentFormValues) {
  return {
    location: values.location,
    adjustment_type: values.adjustment_type,
    reason: values.reason?.trim() || "",
    lines: [],
  };
}

export function toUpdateStockAdjustmentFormValues(
  adjustment: StockAdjustment,
): CreateStockAdjustmentFormValues {
  return {
    location: adjustment.location,
    adjustment_type:
      adjustment.adjustment_type === "COST" ? "COST" : "QUANTITY",
    reason: adjustment.reason ?? "",
  };
}

export function toUpdateStockAdjustmentPayload(values: CreateStockAdjustmentFormValues) {
  return {
    location: values.location,
    adjustment_type: values.adjustment_type,
    reason: values.reason?.trim() || "",
  };
}
