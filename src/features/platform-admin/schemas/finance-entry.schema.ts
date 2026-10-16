import { z } from "zod";

const amount = z
  .string()
  .trim()
  .min(1, "Enter an amount")
  .refine(
    (v) => Number.isFinite(Number(v)) && Number(v) > 0,
    "Amount must be greater than 0",
  )
  .refine((v) => /^\d+(\.\d{1,2})?$/.test(v), "Use at most 2 decimal places");

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date")
  .refine(
    (v) => v <= new Date().toISOString().slice(0, 10),
    "Date can't be in the future",
  );

export const tenantPaymentEntrySchema = z.object({
  tenant: z.string().min(1, "Select a tenant"),
  amount,
  payment_date: isoDate,
  notes: z
    .string()
    .max(500, "Keep notes under 500 characters")
    .optional()
    .default(""),
});

export const operatingCostEntrySchema = z.object({
  category: z.enum([
    "infrastructure",
    "payroll",
    "software",
    "support",
    "other",
  ]),
  amount,
  cost_date: isoDate,
  description: z
    .string()
    .max(500, "Keep it under 500 characters")
    .optional()
    .default(""),
});

export const cashSnapshotEntrySchema = z.object({
  amount: z
    .string()
    .trim()
    .min(1, "Enter a balance")
    .refine(
      (v) => /^\d+(\.\d{1,2})?$/.test(v),
      "Enter a non-negative amount (max 2 decimals)",
    ),
  balance_date: isoDate,
});

export type TenantPaymentEntryValues = z.input<typeof tenantPaymentEntrySchema>;
export type OperatingCostEntryValues = z.input<typeof operatingCostEntrySchema>;
export type CashSnapshotEntryValues = z.input<typeof cashSnapshotEntrySchema>;
