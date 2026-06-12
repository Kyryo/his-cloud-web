import { z } from "zod";

import type { InternalOrder } from "@/features/inventory/types/inventory.types";

export const createInternalOrderSchema = z
  .object({
    source_location: z.coerce
      .number()
      .int()
      .positive("Source location is required."),
    destination_location: z.coerce
      .number()
      .int()
      .positive("Destination location is required."),
    notes: z.string().trim().optional(),
  })
  .refine((data) => data.source_location !== data.destination_location, {
    message: "Source and destination must be different.",
    path: ["destination_location"],
  });

export type CreateInternalOrderFormValues = z.infer<typeof createInternalOrderSchema>;

export function createInternalOrderDefaultValues(): CreateInternalOrderFormValues {
  return {
    source_location: 0,
    destination_location: 0,
    notes: "",
  };
}

export function toCreateInternalOrderPayload(values: CreateInternalOrderFormValues) {
  return {
    source_location: values.source_location,
    destination_location: values.destination_location,
    notes: values.notes?.trim() || null,
    lines: [] as const,
  };
}

export function toUpdateInternalOrderFormValues(
  order: InternalOrder,
): CreateInternalOrderFormValues {
  return {
    source_location: order.source_location,
    destination_location: order.destination_location,
    notes: order.notes ?? "",
  };
}
