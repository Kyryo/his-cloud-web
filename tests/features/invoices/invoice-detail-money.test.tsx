import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { InvoiceDetailMoney } from "@/features/invoices/components/detail/InvoiceDetailMoney";
import type { Invoice } from "@/features/invoices/types/invoice.types";

describe("InvoiceDetailMoney", () => {
  it("shows due, paid, and total", () => {
    render(
      <InvoiceDetailMoney
        invoice={
          {
            amount_total: "10000",
            amount_paid: "2500",
            amount_residual: "7500",
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
            insurance_company: "MASM",
          } as Invoice
        }
      />,
    );

    const money = screen.getByTestId("invoice-detail-money");
    expect(money).toHaveTextContent("Due");
    expect(money).toHaveTextContent("7,500.00 MWK");
    expect(money).toHaveTextContent("Paid");
    expect(money).toHaveTextContent("2,500.00 MWK");
    expect(money).toHaveTextContent("Total");
    expect(money).toHaveTextContent("10,000.00 MWK");
    expect(money).toHaveTextContent("MASM due");
    expect(money).toHaveTextContent("Client due");
  });
});
