import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { SalesOrderConvertToInvoiceAction } from "@/features/sales-orders/components/detail/SalesOrderConvertToInvoiceAction";
import type { SalesOrder } from "@/features/sales-orders/types/sales-order.types";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("@/providers/toast-provider", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

afterEach(() => {
  cleanup();
});

function buildOrder(overrides: Partial<SalesOrder> = {}): SalesOrder {
  return {
    id: 10,
    name: "SO00010",
    date_order: "2026-08-11",
    state: "sale",
    invoice_status: "to invoice",
    customer_id: 1,
    customer_uuid: "cust-uuid",
    customer_name: "Jane Doe",
    amount_untaxed: "100.00",
    amount_tax: "0.00",
    amount_total: "100.00",
    currency_code: "MWK",
    pricelist_id: null,
    pricelist_name: null,
    clinic_id: 1,
    clinic_name: "Main Clinic",
    visit_id: null,
    visit_uuid: null,
    provider_id: null,
    provider_name: null,
    insurance_scheme_id: null,
    insurance_scheme_name: null,
    insurance_company: null,
    insurance_number: null,
    insurance_number_prefix: null,
    authorization_number: null,
    lines: [
      {
        id: 1,
        name: "Consultation",
        product_id: 1,
        quantity: "1",
        is_payable: true,
      },
    ],
    ...overrides,
  };
}

describe("SalesOrderConvertToInvoiceAction", () => {
  it("shows Create invoice before the order is invoiced", () => {
    render(
      <SalesOrderConvertToInvoiceAction
        order={buildOrder()}
        onOrderUpdated={vi.fn()}
      />,
    );

    expect(
      screen.getByTestId("sales-order-convert-to-invoice-button"),
    ).toHaveTextContent("Create invoice");
    expect(
      screen.queryByTestId("sales-order-view-invoice-button"),
    ).not.toBeInTheDocument();
  });

  it("replaces Create invoice with a secondary View invoice link when invoiced", () => {
    render(
      <SalesOrderConvertToInvoiceAction
        order={buildOrder({
          invoice_status: "invoiced",
          invoice_id: 55,
          state: "done",
        })}
        onOrderUpdated={vi.fn()}
      />,
    );

    const viewButton = screen.getByTestId("sales-order-view-invoice-button");
    expect(viewButton).toHaveTextContent("View invoice");
    expect(viewButton).toHaveAttribute("href", "/invoices/55");
    expect(
      screen.queryByTestId("sales-order-convert-to-invoice-button"),
    ).not.toBeInTheDocument();
  });
});
