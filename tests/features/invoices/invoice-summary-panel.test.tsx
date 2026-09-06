import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { InvoiceSummaryPanel } from "@/features/invoices/components/detail/InvoiceSummaryPanel";
import type { Invoice } from "@/features/invoices/types/invoice.types";

const invoice = {
  id: 81,
  uuid: "c356dab6-4349-408b-bc23-dd98d08b9dbf",
  name: "INV/2026/0001",
  state: "posted",
  customer_id: 12,
  customer_uuid: "cust-12",
  customer_name: "Ada Lovelace",
  amount_untaxed: "10000",
  amount_tax: "0",
  amount_total: "10000",
  amount_paid: "2500",
  amount_residual: "7500",
  payment_status: "partially_paid",
  invoice_date: "2026-08-09",
  insurance_company: "MASM",
  insurance_scheme_name: "Executive",
  insurance_number: "MEM-4411",
  lines: [
    {
      id: 1,
      name: "Consultation",
      product_id: 1,
      product_name: "Consultation",
      quantity: "1",
      price_unit: "10000",
      price_subtotal: "10000",
      price_total: "10000",
      is_payable: true,
      insurer_due: "8000",
      client_due: "2000",
    },
  ],
} as Invoice;

afterEach(() => {
  cleanup();
});

describe("InvoiceSummaryPanel", () => {
  it("shows 3 key figures at the top of the summary", () => {
    render(<InvoiceSummaryPanel invoice={invoice} />);

    const stats = screen.getByTestId("invoice-summary-stats");
    expect(stats).toHaveTextContent("Total");
    expect(stats).toHaveTextContent("10,000.00");
    expect(stats).toHaveTextContent("Paid");
    expect(stats).toHaveTextContent("2,500.00");
    expect(stats).toHaveTextContent("Balance");
    expect(stats).toHaveTextContent("7,500.00");
  });

  it("shows billing split and coverage details", () => {
    render(<InvoiceSummaryPanel invoice={invoice} />);

    expect(screen.getByText("MASM due")).toBeInTheDocument();
    expect(screen.getByText("Client due")).toBeInTheDocument();
    expect(screen.getByText("MASM - Executive")).toBeInTheDocument();
    expect(screen.getByText("MEM-4411")).toBeInTheDocument();
  });
});
