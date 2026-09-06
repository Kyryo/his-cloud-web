import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { InvoiceLineList } from "@/features/invoices/components/detail/InvoiceLineList";
import type { Invoice } from "@/features/invoices/types/invoice.types";

const invoice = {
  id: 81,
  uuid: "c356dab6-4349-408b-bc23-dd98d08b9dbf",
  name: "INV/2026/0001",
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
  it("renders line items as a list instead of a table", () => {
    render(<InvoiceLineList invoice={invoice} onViewDetails={vi.fn()} />);

    expect(screen.getByTestId("invoice-lines-list")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(screen.getByText("Consultation")).toBeInTheDocument();
    expect(screen.getByText("Tariff")).toBeInTheDocument();
    expect(screen.getByText("CONS-01")).toBeInTheDocument();
    expect(screen.getByText("Qty")).toBeInTheDocument();
    expect(screen.getByText("Price")).toBeInTheDocument();
    expect(screen.getAllByText("15,000.00 MWK").length).toBeGreaterThan(0);
  });
});
