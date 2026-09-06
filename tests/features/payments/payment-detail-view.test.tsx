import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PaymentDetailView } from "@/features/payments/components/detail/PaymentDetailView";
import type { CustomerBillingSummary } from "@/features/customers/types/customer-billing.types";
import type { CustomerInsurance } from "@/features/customers/types/customer-insurance.types";
import type { Customer } from "@/features/customers/types/customer.types";
import type { Payment } from "@/features/payments/types/payment.types";

const fetchCustomer = vi.fn();
const fetchCustomerInsurance = vi.fn();
const fetchCustomerBillingSummary = vi.fn();

vi.mock("@/features/customers/services/customers.service", () => ({
  fetchCustomer: (...args: unknown[]) => fetchCustomer(...args),
}));

vi.mock("@/features/customers/services/customer-insurance.service", () => ({
  fetchCustomerInsurance: (...args: unknown[]) => fetchCustomerInsurance(...args),
}));

vi.mock("@/features/customers/services/customer-billing.service", () => ({
  fetchCustomerBillingSummary: (...args: unknown[]) =>
    fetchCustomerBillingSummary(...args),
}));

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
  note: "Front desk receipt",
  recorded_by_name: "Grace Hopper",
} as Payment;

const customer: Customer = {
  id: 12,
  uuid: "cust-12",
  tenant: 1,
  first_name: "Ada",
  middle_name: null,
  last_name: "Lovelace",
  full_name: "Ada Lovelace",
  customer_identifier: "P-001",
  internal_reference: "REF-22",
  phone_number: "+265111222333",
  email: "ada@example.com",
  patient_uuid: "patient-1",
  gender: "Female",
  dob: "1990-08-04",
  dob_is_estimated: false,
  age: 35,
  is_active: true,
  visit_status: "active",
  has_synced_to_openmrs: false,
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
  created_by: 1,
};

const insurance: CustomerInsurance[] = [
  {
    id: 3,
    uuid: "ins-3",
    customer: 12,
    insurance_scheme: 44,
    scheme_name: "VIP",
    insurance_company_name: "MASM",
    insurance_company_code: "MASM",
    membership_number: "MEM123",
    suffix: "001",
    is_principal_member: true,
    principal_member_name: "Ada Lovelace",
    relationship_to_principal_member: "Self",
    is_primary: true,
    date_joined: null,
    pricelist_id: 1,
    is_active: true,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
  },
];

const billing = {
  sales_orders_pagination: { count: 2, limit: 1, offset: 0, has_next: false, has_previous: false },
  invoices_pagination: { count: 1, limit: 1, offset: 0, has_next: false, has_previous: false },
  payments_pagination: { count: 1, limit: 1, offset: 0, has_next: false, has_previous: false },
  totals: {
    opening_balance: "0",
    total_sales: "20000",
    total_invoiced: "20000",
    total_paid: "12500",
    total_due: "7500",
  },
} as CustomerBillingSummary;

describe("PaymentDetailView", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    fetchCustomer.mockReset();
    fetchCustomerInsurance.mockReset();
    fetchCustomerBillingSummary.mockReset();
    fetchCustomer.mockResolvedValue(customer);
    fetchCustomerInsurance.mockResolvedValue(insurance);
    fetchCustomerBillingSummary.mockResolvedValue(billing);
  });

  it("renders the receipt, allocation, and client on one page without tabs", async () => {
    render(<PaymentDetailView payment={payment} />);

    expect(screen.getByTestId("payment-detail-view")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Overview" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Client" })).not.toBeInTheDocument();
    expect(screen.queryByTestId("payment-summary-fab")).not.toBeInTheDocument();

    expect(screen.getByTestId("payment-receipt-amount")).toHaveTextContent("12,500.00");
    expect(screen.getByText("MWK")).toBeInTheDocument();
    expect(screen.getByText("Cash")).toBeInTheDocument();
    expect(screen.getByText("PAY/2026/0056")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /INV\/2026\/0001/ })).toHaveAttribute(
      "href",
      "/invoices/inv-81",
    );
    expect(screen.getByText("Grace Hopper")).toBeInTheDocument();
    expect(screen.getByText("Front desk receipt")).toBeInTheDocument();
    expect(screen.getByText("9 Aug 2026")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Ada Lovelace" })).toBeInTheDocument();
    });
    expect(screen.getByText("MASM · VIP")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View client" })).toHaveAttribute(
      "href",
      "/customers/cust-12",
    );
  });

  it("shows opening balance allocation without an invoice link", async () => {
    render(
      <PaymentDetailView
        payment={{
          ...payment,
          applies_to_opening_balance: true,
          invoice_id: null,
          invoice_uuid: null,
          invoice_name: null,
        }}
      />,
    );

    expect(screen.getByText("Opening balance")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Opening balance/ })).not.toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Ada Lovelace" })).toBeInTheDocument();
    });
  });

  it("marks a cancelled receipt", async () => {
    render(<PaymentDetailView payment={{ ...payment, state: "cancel" }} />);

    expect(screen.getByText("This receipt was cancelled.")).toBeInTheDocument();
    expect(screen.getByTestId("payment-receipt-amount")).toHaveClass("line-through");
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Ada Lovelace" })).toBeInTheDocument();
    });
  });
});
