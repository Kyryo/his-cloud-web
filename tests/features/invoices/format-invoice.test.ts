import { describe, expect, it } from "vitest";

import {
  formatInvoiceCollectionCopy,
  formatInvoiceDate,
} from "@/features/invoices/utils/format-invoice";
import { formatInvoicePaymentStatusLabel } from "@/features/invoices/utils/invoice-payment-status";
import type { Invoice } from "@/features/invoices/types/invoice.types";

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

describe("formatInvoiceCollectionCopy", () => {
  it("describes an unpaid invoice", () => {
    expect(
      formatInvoiceCollectionCopy({
        amount_total: "110",
        amount_paid: "0",
        amount_residual: "110",
      } as Invoice),
    ).toBe("110.00 MWK is due. No payment recorded yet.");
  });

  it("describes a partial payment", () => {
    expect(
      formatInvoiceCollectionCopy({
        amount_total: "10000",
        amount_paid: "2500",
        amount_residual: "7500",
      } as Invoice),
    ).toBe("7,500.00 MWK is still due. 2,500.00 MWK of 10,000.00 MWK received.");
  });

  it("describes a settled invoice", () => {
    expect(
      formatInvoiceCollectionCopy({
        amount_total: "80",
        amount_paid: "80",
        amount_residual: "0",
      } as Invoice),
    ).toBe("Settled. 80.00 MWK received.");
  });
});
