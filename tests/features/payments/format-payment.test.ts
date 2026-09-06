import { describe, expect, it } from "vitest";

import type { Payment } from "@/features/payments/types/payment.types";
import { formatPaymentAllocationLabel } from "@/features/payments/utils/format-payment";
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
  it("maps cancel to Cancelled", () => {
    expect(formatPaymentStateLabel("cancel")).toBe("Cancelled");
    expect(formatPaymentStateLabel("posted")).toBe("Posted");
  });

  it("prefers opening balance over invoice name", () => {
    expect(
      formatPaymentAllocationLabel({
        ...payment,
        applies_to_opening_balance: true,
      }),
    ).toBe("Opening balance");
  });
});
