import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { InvoiceLineList } from "@/features/invoices/components/detail/InvoiceLineList";
import type { Invoice } from "@/features/invoices/types/invoice.types";

const invoice = {
  id: 81,
  uuid: "c356dab6-4349-408b-bc23-dd98d08b9dbf",
  name: "INV/2026/0001",
  amount_total: "15000",
  lines: [
    {
      id: 11,
      name: "Consultation",
      product_name: "Consultation",
      quantity: "1",
      price_unit: "15000",
      price_total: "15000",
      tariff_code: "CONS-01",
      is_payable: true,
    },
  ],
} as unknown as Invoice;

describe("InvoiceLineList", () => {
  it("renders line items as a table", () => {
    render(<InvoiceLineList invoice={invoice} onViewDetails={vi.fn()} />);

    expect(screen.getByTestId("invoice-lines-list")).toBeInTheDocument();
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Item" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Tariff" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Qty" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Price" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Total" })).toBeInTheDocument();
    expect(screen.getByText("Consultation")).toBeInTheDocument();
    expect(screen.getByText("CONS-01")).toBeInTheDocument();
    expect(screen.getAllByText("15,000.00 MWK").length).toBeGreaterThan(0);
  });

  it("adds insurer and client columns when a line has a payment split", () => {
    render(
      <InvoiceLineList
        invoice={
          {
            ...invoice,
            insurance_company: "MASM",
            lines: [
              {
                ...invoice.lines![0],
                insurer_due: "10000",
                client_due: "5000",
              },
            ],
          } as Invoice
        }
        onViewDetails={vi.fn()}
      />,
    );

    expect(screen.getByRole("columnheader", { name: "Insurer" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Client" })).toBeInTheDocument();
    expect(screen.getByText("10,000.00")).toBeInTheDocument();
    expect(screen.getByText("5,000.00")).toBeInTheDocument();
  });
});
