import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { InvoiceLineBillingSummary } from "@/features/invoices/components/detail/InvoiceLineBillingSummary";
import type { Invoice } from "@/features/invoices/types/invoice.types";

describe("InvoiceLineBillingSummary", () => {
  it("shows the bill breakdown under line items", () => {
    render(
      <InvoiceLineBillingSummary
        invoice={
          {
            amount_untaxed: "10000",
            amount_tax: "0",
            insurance_company: "MASM",
            insurance_number: "MEM-4411",
            pricelist_name: "MASM Executive",
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
          } as Invoice
        }
      />,
    );

    const summary = screen.getByTestId("invoice-lines-billing");
    expect(summary).toHaveTextContent("MASM due");
    expect(summary).toHaveTextContent("Client due");
    expect(summary).toHaveTextContent("Gross");
    expect(summary).toHaveTextContent("MEM-4411");
    expect(summary).toHaveTextContent("MASM Executive");
  });
});
