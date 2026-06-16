import { z } from "zod";

export const PAYMENT_METHOD_OPTIONS = [
  { value: "Cash", label: "Cash" },
  { value: "Mobile Money", label: "Mobile Money" },
  { value: "Bank Transfer", label: "Bank Transfer" },
  { value: "Card", label: "Card" },
] as const;

export const recordPaymentSchema = z.object({
  amount: z
    .string()
    .trim()
    .min(1, "Amount is required")
    .refine((value) => {
      const parsed = Number(value);
      return Number.isFinite(parsed) && parsed > 0;
    }, "Enter a valid amount greater than zero"),
  paymentMethod: z.string().trim().min(1, "Payment method is required"),
  paymentDate: z.string().trim().min(1, "Payment date is required"),
  note: z.string().trim().max(1000, "Notes are too long"),
});

export type RecordPaymentFormValues = z.infer<typeof recordPaymentSchema>;

export function buildRecordPaymentDefaultValues(
  amountTotal: string | number | null | undefined,
): RecordPaymentFormValues {
  const normalized =
    amountTotal === null || amountTotal === undefined || amountTotal === ""
      ? ""
      : String(amountTotal);

  return {
    amount: normalized,
    paymentMethod: "Cash",
    paymentDate: new Date().toISOString().slice(0, 10),
    note: "",
  };
}

export function toRecordPaymentPayload(
  invoiceId: number,
  values: RecordPaymentFormValues,
) {
  return {
    invoiceId,
    amount: values.amount.trim(),
    paymentMethod: values.paymentMethod.trim(),
    paymentDate: values.paymentDate,
    note: values.note.trim() || undefined,
  };
}
