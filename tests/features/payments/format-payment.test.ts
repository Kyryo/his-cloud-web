import { describe, expect, it } from "vitest";

import type { Payment } from "@/features/payments/types/payment.types";
import {
  formatPaymentAllocationLabel,
  formatPaymentDay,
  formatPaymentRecordedBy,
  getPaymentAllocationHref,
} from "@/features/payments/utils/format-payment";
import { formatPaymentStateLabel } from "@/features/payments/utils/payment-status";

const payment = {
  id: 56,
  name: "PAY/2026/0056",
  state: "posted",
  customer_id: 12,
  customer_uuid: "cust-12",
  customer_name: "Ada Lovelace",
  invoice_id: 81,
  invoice_uuid: "inv-81",
  invoice_name: "INV/2026/0001",
  amount: "12500",
  payment_date: "2026-08-09",
} as Payment;

describe("format-payment", () => {
  it("formats payment dates without a clock time", () => {
    expect(formatPaymentDay("2026-08-09")).toBe("9 Aug 2026");
    expect(formatPaymentDay(null)).toBe("—");
  });

  it("maps cancel to Cancelled", () => {
    expect(formatPaymentStateLabel("cancel")).toBe("Cancelled");
    expect(formatPaymentStateLabel("posted")).toBe("Posted");
  });

  it("returns an invoice href when a payment is allocated", () => {
    expect(getPaymentAllocationHref(payment)).toBe("/invoices/inv-81");
    expect(
      getPaymentAllocationHref({
        ...payment,
        applies_to_opening_balance: true,
        invoice_id: null,
        invoice_uuid: null,
      }),
    ).toBeNull();
  });

  it("prefers opening balance over invoice name", () => {
    expect(
      formatPaymentAllocationLabel({
        ...payment,
        applies_to_opening_balance: true,
      }),
    ).toBe("Opening balance");
  });

  it("prefers recorded-by name over email", () => {
    expect(
      formatPaymentRecordedBy({
        ...payment,
        recorded_by_name: "Grace Hopper",
        recorded_by_email: "grace@example.com",
      }),
    ).toBe("Grace Hopper");
    expect(
      formatPaymentRecordedBy({
        ...payment,
        recorded_by_name: null,
        recorded_by_email: "grace@example.com",
      }),
    ).toBe("grace@example.com");
  });
});
