import { z } from "zod";

export const editVisitPaymentSchema = z
  .object({
    mode_of_payment: z.enum(["cash", "insurance"]),
    // nullish: cash mode clears the scheme with an explicit null payload
    insurance_scheme: z.string().nullish(),
  })
  .superRefine((values, context) => {
    if (values.mode_of_payment === "insurance" && !values.insurance_scheme) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Select an insurance scheme",
        path: ["insurance_scheme"],
      });
    }
  });

export type EditVisitPaymentFormValues = z.infer<typeof editVisitPaymentSchema>;

export function toEditVisitPaymentDefaultValues(
  visit: {
    mode_of_payment: "cash" | "insurance";
    insurance_scheme: string | null;
  },
): EditVisitPaymentFormValues {
  return {
    mode_of_payment: visit.mode_of_payment,
    insurance_scheme: visit.insurance_scheme ?? "",
  };
}

export function toUpdateVisitPaymentModePayload(
  values: EditVisitPaymentFormValues,
): {
  mode_of_payment: "cash" | "insurance";
  insurance_scheme?: string | null;
} {
  return {
    mode_of_payment: values.mode_of_payment,
    insurance_scheme:
      values.mode_of_payment === "insurance"
        ? values.insurance_scheme || null
        : null,
  };
}
