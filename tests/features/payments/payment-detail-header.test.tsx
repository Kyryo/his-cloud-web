import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { PaymentDetailHeader } from "@/features/payments/components/detail/PaymentDetailHeader";
import type { Payment } from "@/features/payments/types/payment.types";

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
  payment_method: "Cash",
  recorded_by_name: "Grace Hopper",
} as Payment;

afterEach(() => {
  cleanup();
});

describe("PaymentDetailHeader", () => {
  it("shows the receipt number, payer, and status", () => {
    render(<PaymentDetailHeader payment={payment} />);

    expect(screen.getByRole("heading", { name: "PAY/2026/0056" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ada Lovelace" })).toHaveAttribute(
      "href",
      "/customers/cust-12",
    );
    expect(screen.getByText("Cash")).toBeInTheDocument();
    expect(screen.getByText("9 Aug 2026")).toBeInTheDocument();
    expect(screen.getByText("Posted")).toBeInTheDocument();
  });
});
