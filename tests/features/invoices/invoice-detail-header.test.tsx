import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { InvoiceDetailHeader } from "@/features/invoices/components/detail/InvoiceDetailHeader";
import type { Invoice } from "@/features/invoices/types/invoice.types";

describe("InvoiceDetailHeader", () => {
  it("shows identity, meta, payment badge, and status", () => {
    render(
      <InvoiceDetailHeader
        invoice={
          {
            id: 81,
            name: "INV/2026/0001",
            state: "posted",
            customer_name: "Ada Lovelace",
            invoice_date: "2026-08-09",
            payment_status: "partially_paid",
            insurance_company: "MASM",
            insurance_scheme_name: "Executive",
            pricelist_name: "VIP",
            amount_total: "10000",
            amount_paid: "2500",
            amount_residual: "7500",
          } as Invoice
        }
      />,
    );

    expect(screen.getByRole("heading", { name: "Ada Lovelace" })).toBeInTheDocument();
    expect(screen.getByText("INV/2026/0001")).toBeInTheDocument();
    expect(screen.getByText("Partially paid")).toBeInTheDocument();
    expect(screen.getByText("MASM - Executive")).toBeInTheDocument();
    expect(screen.getByTestId("invoice-header-meta")).toHaveTextContent("9 Aug 2026");
  });
});
