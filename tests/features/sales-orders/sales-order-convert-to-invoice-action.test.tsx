import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SalesOrderConvertToInvoiceAction } from "@/features/sales-orders/components/detail/SalesOrderConvertToInvoiceAction";
import type { Invoice } from "@/features/invoices/types/invoice.types";
import type { SalesOrder } from "@/features/sales-orders/types/sales-order.types";

const createSalesOrderInvoice = vi.fn();
const fetchSalesOrder = vi.fn();
const fetchInvoice = vi.fn();
const fetchClaimByInvoice = vi.fn();
const createClaimFromInvoice = vi.fn();
const evaluateClaimAdvisories = vi.fn();
const fetchClaim = vi.fn();
const toast = vi.fn();
const push = vi.fn();

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

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("@/providers/toast-provider", () => ({
  useToast: () => ({ toast }),
}));

vi.mock("@/features/sales-orders/services/sales-orders.service", () => ({
  createSalesOrderInvoice: (...args: unknown[]) => createSalesOrderInvoice(...args),
  fetchSalesOrder: (...args: unknown[]) => fetchSalesOrder(...args),
}));

vi.mock("@/features/invoices/services/invoices.service", () => ({
  fetchInvoice: (...args: unknown[]) => fetchInvoice(...args),
}));

vi.mock("@/features/claims/services/claims.service", () => ({
  fetchClaimByInvoice: (...args: unknown[]) => fetchClaimByInvoice(...args),
  fetchClaim: (...args: unknown[]) => fetchClaim(...args),
  createClaimFromInvoice: (...args: unknown[]) => createClaimFromInvoice(...args),
  evaluateClaimAdvisories: (...args: unknown[]) => evaluateClaimAdvisories(...args),
  submitClaim: vi.fn(),
  createClaimAdvisoryOverride: vi.fn(),
  isInsuranceInvoice: () => true,
}));

vi.mock("@/features/visits/services/visits.service", () => ({
  fetchVisitEncounters: vi.fn().mockResolvedValue([]),
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

function buildInvoice(overrides: Partial<Invoice> = {}): Invoice {
  return {
    id: 55,
    name: "INV055",
    state: "posted",
    customer_id: 1,
    customer_uuid: null,
    customer_name: "Jane Doe",
    amount_untaxed: "100",
    amount_tax: "0",
    amount_total: "100",
    invoice_date: "2026-01-01",
    insurance_scheme_id: 3,
    insurance_company: "MASM",
    has_diagnosis: true,
    has_practitioner_mapping: true,
    can_initiate_claim: true,
    claim_payer_code: "MASM",
    payer_integration_configured: true,
    visit_uuid: "visit-1",
    lines: [
      {
        id: 1,
        name: "Consult",
        product_id: 1,
        product_name: "Consult",
        quantity: "1",
        price_unit: "100",
        price_subtotal: "100",
        price_total: "100",
        is_payable: true,
        tariff_code: "TARIFF-1",
      },
    ],
    ...overrides,
  };
}

function ConvertHarness({ initialOrder }: { initialOrder: SalesOrder }) {
  const [order, setOrder] = useState(initialOrder);
  return (
    <SalesOrderConvertToInvoiceAction order={order} onOrderUpdated={setOrder} />
  );
}

describe("SalesOrderConvertToInvoiceAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchClaimByInvoice.mockResolvedValue(null);
    fetchInvoice.mockImplementation(async (id: number) =>
      buildInvoice({ id, insurance_number: "3456789-0-1" }),
    );
  });

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

  it("does not open the next-step dialog when payer integration is not configured", async () => {
    const invoice = buildInvoice({ payer_integration_configured: false });
    createSalesOrderInvoice.mockResolvedValue({
      sales_order: 10,
      invoice,
    });
    fetchSalesOrder.mockResolvedValue(
      buildOrder({
        invoice_status: "invoiced",
        invoice_id: invoice.id,
        state: "done",
      }),
    );

    render(<ConvertHarness initialOrder={buildOrder()} />);

    fireEvent.click(screen.getByTestId("sales-order-convert-to-invoice-button"));
    fireEvent.click(screen.getByTestId("sales-order-convert-to-invoice-confirm-button"));

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({ variant: "success", title: "Invoice created" }),
      );
    });
    expect(
      screen.queryByTestId("sales-order-invoice-created-dialog"),
    ).not.toBeInTheDocument();
  });

  it("opens the invoice created dialog when payer integration is configured", async () => {
    const invoice = buildInvoice();
    createSalesOrderInvoice.mockResolvedValue({
      sales_order: 10,
      invoice,
    });
    fetchSalesOrder.mockResolvedValue(
      buildOrder({
        invoice_status: "invoiced",
        invoice_id: invoice.id,
        state: "done",
      }),
    );

    render(<ConvertHarness initialOrder={buildOrder()} />);

    fireEvent.click(screen.getByTestId("sales-order-convert-to-invoice-button"));
    fireEvent.click(screen.getByTestId("sales-order-convert-to-invoice-confirm-button"));

    await waitFor(() => {
      expect(
        screen.getByTestId("sales-order-invoice-created-dialog"),
      ).toBeInTheDocument();
    });
    expect(screen.getByText("Invoice was successfully created")).toBeInTheDocument();
    expect(screen.getByText("What would you like to do next?")).toBeInTheDocument();
    expect(screen.getByTestId("sales-order-invoice-created-options")).toBeInTheDocument();
    expect(screen.getByTestId("sales-order-prepare-claim-button")).toHaveTextContent(
      "Prepare Claim",
    );
    expect(screen.getByTestId("sales-order-view-invoice-next-button")).toHaveTextContent(
      "View Invoice",
    );
    expect(screen.getByTestId("sales-order-invoice-created-close-button")).toHaveTextContent(
      "Close",
    );
    expect(toast).not.toHaveBeenCalledWith(
      expect.objectContaining({ variant: "success" }),
    );
  });

  it("navigates to the invoice from the next-step dialog", async () => {
    const invoice = buildInvoice();
    createSalesOrderInvoice.mockResolvedValue({
      sales_order: 10,
      invoice,
    });
    fetchSalesOrder.mockResolvedValue(
      buildOrder({
        invoice_status: "invoiced",
        invoice_id: invoice.id,
        state: "done",
      }),
    );

    render(<ConvertHarness initialOrder={buildOrder()} />);

    fireEvent.click(screen.getByTestId("sales-order-convert-to-invoice-button"));
    fireEvent.click(screen.getByTestId("sales-order-convert-to-invoice-confirm-button"));

    await waitFor(() => {
      expect(
        screen.getByTestId("sales-order-view-invoice-next-button"),
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("sales-order-view-invoice-next-button"));

    expect(push).toHaveBeenCalledWith("/invoices/55");
  });

  it("opens the claim workflow from Prepare Claim without submitting", async () => {
    const invoice = buildInvoice({ insurance_number: "3456789-0-1" });
    createSalesOrderInvoice.mockResolvedValue({
      sales_order: 10,
      invoice,
    });
    fetchSalesOrder.mockResolvedValue(
      buildOrder({
        invoice_status: "invoiced",
        invoice_id: invoice.id,
        state: "done",
      }),
    );
    fetchInvoice.mockResolvedValue(invoice);

    render(<ConvertHarness initialOrder={buildOrder()} />);

    fireEvent.click(screen.getByTestId("sales-order-convert-to-invoice-button"));
    fireEvent.click(screen.getByTestId("sales-order-convert-to-invoice-confirm-button"));

    await waitFor(() => {
      expect(screen.getByTestId("sales-order-prepare-claim-button")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("sales-order-prepare-claim-button"));

    await waitFor(() => {
      expect(screen.getByTestId("sales-order-prepare-claim-dialog")).toBeInTheDocument();
      expect(screen.getByTestId("claim-requirements-stage")).toBeInTheDocument();
    });
    expect(screen.queryByTestId("claim-workflow-card")).not.toBeInTheDocument();
    expect(screen.queryByText("Advisory")).not.toBeInTheDocument();
    expect(screen.queryByText("Queue for submission")).not.toBeInTheDocument();
    expect(createClaimFromInvoice).not.toHaveBeenCalled();
    expect(screen.getByTestId("invoice-create-claim-button")).toBeInTheDocument();
    expect(screen.getByTestId("claim-requirements-card")).toBeInTheDocument();
    expect(screen.getByTestId("claim-requirement-add-diagnosis-button")).toBeInTheDocument();
    expect(screen.queryByTestId("invoice-submit-claim-button")).not.toBeInTheDocument();
  });
});
