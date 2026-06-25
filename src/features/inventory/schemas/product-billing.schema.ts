import { z } from "zod";

export const MIN_CHARGE_OCCURRENCES = 1;
export const MAX_CHARGE_OCCURRENCES = 10;

export const productBillingSchema = z.object({
  charge_occurrences: z.coerce
    .number()
    .int("Charge occurrences must be a whole number.")
    .min(
      MIN_CHARGE_OCCURRENCES,
      `Charge occurrences must be at least ${MIN_CHARGE_OCCURRENCES}.`,
    )
    .max(
      MAX_CHARGE_OCCURRENCES,
      `Charge occurrences cannot exceed ${MAX_CHARGE_OCCURRENCES}.`,
    ),
});

export type ProductBillingFormValues = z.infer<typeof productBillingSchema>;
