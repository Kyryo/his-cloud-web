import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { PaymentDetailTabs } from "@/features/payments/components/detail/PaymentDetailTabs";
import type { Payment } from "@/features/payments/types/payment.types";

const payment = {
  id: 56,
  name: "PAY/2026/0056",
  state: "posted",
  customer_id: 12,
  customer_uuid: null,
  customer_name: "Ada Lovelace",
  invoice_id: 81,
  invoice_uuid: "inv-81",
  invoice_name: "INV/2026/0001",
  amount: "12500",
  payment_date: "2026-08-09",
  payment_method: "Cash",
  note: "Paid at reception",
} as Payment;

afterEach(() => {
  cleanup();
});

describe("PaymentDetailTabs", () => {
  it("shows overview details and a payment summary", () => {
    render(<PaymentDetailTabs payment={payment} />);

    expect(screen.getByRole("button", { name: "Overview" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Client" })).toBeInTheDocument();
    expect(screen.getByTestId("payment-detail-overview-tab")).toBeVisible();
    expect(screen.getByText("Payment details")).toBeInTheDocument();
    expect(screen.getAllByText("INV/2026/0001").length).toBeGreaterThan(0);
    expect(screen.getByText("Payment summary")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Overview" }).querySelector("svg")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Client" }).querySelector("svg")).toBeTruthy();
  });

  it("switches to the client tab", () => {
    render(<PaymentDetailTabs payment={payment} />);

    fireEvent.click(screen.getByRole("button", { name: "Client" }));

    expect(screen.getByTestId("payment-detail-client-tab")).toBeVisible();
    expect(screen.getByTestId("payment-client-empty-state")).toBeInTheDocument();
  });
});
