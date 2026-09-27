import { z } from "zod";

const tokenPart = z
  .string()
  .trim()
  .max(32)
  .regex(
    /^[A-Za-z0-9_-]*$/,
    "Use letters, numbers, underscores, or hyphens only",
  );

export const customerIdentifierSettingsSchema = z.object({
  customer_identifier_prefix: tokenPart,
  customer_identifier_digits: z.coerce
    .number()
    .int()
    .min(1, "At least 1 digit")
    .max(12, "At most 12 digits"),
  customer_identifier_separator: z.string().trim().max(4),
  customer_identifier_suffix: tokenPart,
  customer_identifier_start_number: z.coerce
    .number()
    .int()
    .min(1, "Start number must be at least 1"),
});

export type CustomerIdentifierSettingsFormValues = z.infer<
  typeof customerIdentifierSettingsSchema
>;
