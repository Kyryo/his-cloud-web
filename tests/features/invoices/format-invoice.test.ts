import { describe, expect, it } from "vitest";

import { formatInvoiceDate } from "@/features/invoices/utils/format-invoice";
import { formatInvoicePaymentStatusLabel } from "@/features/invoices/utils/invoice-payment-status";

describe("formatInvoiceDate", () => {
  it("formats date-only invoice dates without a time component", () => {
    expect(formatInvoiceDate("2026-08-09")).toBe("9 Aug 2026");
  });

  it("returns an em dash for empty values", () => {
    expect(formatInvoiceDate(null)).toBe("—");
    expect(formatInvoiceDate(undefined)).toBe("—");
    expect(formatInvoiceDate("")).toBe("—");
  });
});

describe("formatInvoicePaymentStatusLabel", () => {
  it("labels not_paid as Unpaid", () => {
    expect(formatInvoicePaymentStatusLabel("not_paid")).toBe("Unpaid");
  });
});
