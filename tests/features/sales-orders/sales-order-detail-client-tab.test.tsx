import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SalesOrderDetailClientTab } from "@/features/sales-orders/components/detail/SalesOrderDetailClientTab";
import type { CustomerBillingSummary } from "@/features/customers/types/customer-billing.types";
import type { CustomerInsurance } from "@/features/customers/types/customer-insurance.types";
import type { Customer } from "@/features/customers/types/customer.types";
import type { SalesOrder } from "@/features/sales-orders/types/sales-order.types";

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

const order = {
  id: 81,
  uuid: "order-81",
  name: "SO00081",
  customer_uuid: "customer-1",
  customer_name: "Jane Doe",
  customer_id: 12,
  currency_code: "MWK",
  insurance_scheme_id: 44,
  insurance_scheme_name: "VIP",
  insurance_company: "MASM",
} as unknown as SalesOrder;

const customer: Customer = {
  id: 12,
  uuid: "customer-1",
  tenant: 1,
  first_name: "Jane",
  middle_name: null,
  last_name: "Doe",
  full_name: "Jane Doe",
  customer_identifier: "P-001",
  internal_reference: "REF-22",
  phone_number: "+265111222333",
  email: "jane@example.com",
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
    principal_member_name: "Jane Doe",
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
    total_paid: "5000",
    total_due: "15000",
  },
} as CustomerBillingSummary;

describe("SalesOrderDetailClientTab", () => {
  beforeEach(() => {
    fetchCustomer.mockReset();
    fetchCustomerInsurance.mockReset();
    fetchCustomerBillingSummary.mockReset();
  });

  it("shows an empty state when the order has no client profile", () => {
    render(
      <SalesOrderDetailClientTab
        order={{ ...order, customer_uuid: null }}
        isActive
      />,
    );

    expect(screen.getByTestId("sales-order-client-empty-state")).toBeInTheDocument();
    expect(screen.getByText("No client linked")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("renders identity, coverage, and account as a record", async () => {
    fetchCustomer.mockResolvedValue(customer);
    fetchCustomerInsurance.mockResolvedValue(insurance);
    fetchCustomerBillingSummary.mockResolvedValue(billing);

    render(<SalesOrderDetailClientTab order={order} isActive />);

    await waitFor(() => {
      expect(screen.getByTestId("sales-order-client-tab")).toBeInTheDocument();
    });

    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Jane Doe" })).toBeInTheDocument();
    expect(screen.getByText(/P-001 · Female · \d+ years · In clinic/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "+265111222333" })).toHaveAttribute(
      "href",
      "tel:+265111222333",
    );
    expect(screen.getByText("MASM · VIP")).toBeInTheDocument();
    expect(screen.getByText(/MEM123-001 · Principal member · Primary/)).toBeInTheDocument();
    expect(screen.getByText("On this order")).toBeInTheDocument();
    expect(screen.getByText("15,000.00 MWK")).toBeInTheDocument();
    expect(screen.getByText("5,000.00 MWK")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View client" })).toHaveAttribute(
      "href",
      "/customers/customer-1",
    );
  });
});
