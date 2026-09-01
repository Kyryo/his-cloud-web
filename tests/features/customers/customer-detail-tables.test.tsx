import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CustomerSalesOrdersTable } from "@/features/customers/components/detail/CustomerSalesOrdersTable";
import { CustomerInvoicesTable } from "@/features/customers/components/detail/CustomerInvoicesTable";
import { CustomerPaymentsTable } from "@/features/customers/components/detail/CustomerPaymentsTable";
import { CustomerInsuranceTable } from "@/features/customers/components/detail/CustomerInsuranceTable";
import { CustomerVisitsTable } from "@/features/customers/components/detail/CustomerVisitsTable";
import type { CustomerInsurance } from "@/features/customers/types/customer-insurance.types";
import type { CustomerVisit } from "@/features/customers/types/customer-visit.types";

afterEach(() => {
  cleanup();
});

describe("customer detail billing tables", () => {
  it("renders sales order rows and handles row clicks", () => {
    const onRowClick = vi.fn();

    render(
      <CustomerSalesOrdersTable
        orders={[
          {
            id: 11,
            name: "SO0011",
            date_order: "2026-08-01T10:00:00.000Z",
            amount_total: 1500,
            state: "sale",
          },
        ]}
        onRowClick={onRowClick}
      />,
    );

    expect(screen.getByText("SO0011")).toBeInTheDocument();
    expect(screen.getByText("Confirmed")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "View order" }));
    expect(onRowClick).toHaveBeenCalledTimes(1);
    expect(onRowClick).toHaveBeenCalledWith(expect.objectContaining({ id: 11 }));
  });

  it("renders invoice rows with origin, total, and view action", () => {
    const onRowClick = vi.fn();

    render(
      <CustomerInvoicesTable
        invoices={[
          {
            id: 21,
            name: "INV0021",
            state: "posted",
            amount_total: "2500",
            invoice_date: "2026-08-02",
            invoice_origin: "SO0011",
          },
        ]}
        onRowClick={onRowClick}
      />,
    );

    expect(screen.getByText("INV0021")).toBeInTheDocument();
    expect(screen.getByText("SO0011")).toBeInTheDocument();
    expect(screen.getByText("2,500.00")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "View invoice" }));
    expect(onRowClick).toHaveBeenCalledTimes(1);
    expect(onRowClick).toHaveBeenCalledWith(expect.objectContaining({ id: 21 }));
  });

  it("renders payment allocation for opening balance and view action", () => {
    const onRowClick = vi.fn();

    render(
      <CustomerPaymentsTable
        payments={[
          {
            id: 31,
            name: "PAY0031",
            state: "posted",
            amount: "800",
            payment_date: "2026-08-03T09:00:00.000Z",
            payment_method: "Cash",
            applies_to_opening_balance: true,
          },
        ]}
        onRowClick={onRowClick}
      />,
    );

    expect(screen.getByText("PAY0031")).toBeInTheDocument();
    expect(screen.getByText("Opening balance")).toBeInTheDocument();
    expect(screen.getByText("Cash")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "View payment" }));
    expect(onRowClick).toHaveBeenCalledTimes(1);
    expect(onRowClick).toHaveBeenCalledWith(expect.objectContaining({ id: 31 }));
  });

  it("renders insurance memberships and update actions", () => {
    const onUpdate = vi.fn();
    const record: CustomerInsurance = {
      id: 1,
      uuid: "ins-1",
      customer: 9,
      insurance_scheme: 4,
      scheme_name: "VIP",
      insurance_company_name: "MASM",
      membership_number: "MEM123",
      suffix: "001",
      is_principal_member: true,
      principal_member_name: "",
      relationship_to_principal_member: "Self",
      is_primary: true,
      date_joined: null,
      pricelist_id: null,
      is_active: true,
      created_at: "2026-08-01T00:00:00.000Z",
      updated_at: "2026-08-01T00:00:00.000Z",
    };

    render(<CustomerInsuranceTable insurance={[record]} onUpdate={onUpdate} />);

    expect(screen.getByText("MASM")).toBeInTheDocument();
    expect(screen.getByText("VIP")).toBeInTheDocument();
    expect(screen.getByText("MEM123-001")).toBeInTheDocument();
    expect(screen.getByText("Principal member")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Update" }));
    expect(onUpdate).toHaveBeenCalledWith(record);
  });

  it("renders visit rows with scheme and actions", () => {
    const onEdit = vi.fn();
    const onView = vi.fn();
    const visit: CustomerVisit = {
      id: 41,
      uuid: "visit-41",
      appointment: null,
      consultation_service: null,
      consultation_service_name: "General consultation",
      customer: "customer-1",
      customer_name: "Jane Doe",
      customer_identifier: "P-001",
      visit_date: "2026-08-04T10:00:00.000Z",
      status: "in_progress",
      mark_for_completion: false,
      mode_of_payment: "insurance",
      insurance_scheme: "ins-1",
      insurance_scheme_name: "VIP",
      insurance_company_name: "MASM",
      linked_sales_order_state: null,
      can_edit_mode_of_payment: true,
      mode_of_payment_edit_block_reason: null,
      requires_pre_authorization: false,
      pre_authorization_number: "",
      pre_authorization_comments: "",
      is_walk_in: false,
      is_active: true,
      clinic: "clinic-1",
      clinic_name: "Central Clinic",
      closed_by: null,
      created_by: null,
      created_by_name: null,
      encounters: [],
      created_at: "2026-08-04T10:00:00.000Z",
      updated_at: "2026-08-04T10:00:00.000Z",
    };

    render(
      <CustomerVisitsTable visits={[visit]} onEdit={onEdit} onView={onView} />,
    );

    expect(screen.getByText("MASM - VIP")).toBeInTheDocument();
    expect(screen.getByText("Central Clinic")).toBeInTheDocument();
    expect(screen.getByText("Insurance")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    expect(onEdit).toHaveBeenCalledWith(visit);
    fireEvent.click(screen.getByText("MASM - VIP").closest("tr")!);
    expect(onView).toHaveBeenCalledWith(visit);
  });
});
