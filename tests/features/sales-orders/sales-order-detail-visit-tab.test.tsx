import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SalesOrderDetailVisitTab } from "@/features/sales-orders/components/detail/SalesOrderDetailVisitTab";
import type { SalesOrder } from "@/features/sales-orders/types/sales-order.types";
import type { CustomerVisit } from "@/features/customers/types/customer-visit.types";

const fetchVisit = vi.fn();

vi.mock("@/features/customers/services/customer-visits.service", () => ({
  fetchVisit: (...args: unknown[]) => fetchVisit(...args),
}));

const order = {
  id: 81,
  uuid: "order-81",
  name: "SO00081",
  visit_uuid: "visit-41",
  insurance_number: "MEM123",
  insurance_number_prefix: "MS-",
} as unknown as SalesOrder;

const visit: CustomerVisit = {
  id: 41,
  uuid: "visit-41",
  appointment: null,
  consultation_service: "service-1",
  consultation_service_name: "General consultation",
  customer: "customer-1",
  customer_name: "Jane Doe",
  customer_identifier: "P-001",
  visit_date: "2026-08-04T10:00:00.000Z",
  status: "active",
  mark_for_completion: false,
  mode_of_payment: "insurance",
  insurance_scheme: "ins-1",
  insurance_scheme_name: "VIP",
  insurance_company_name: "MASM",
  linked_sales_order_state: "sale",
  can_edit_mode_of_payment: false,
  mode_of_payment_edit_block_reason: null,
  requires_pre_authorization: true,
  pre_authorization_number: "AUTH-88",
  pre_authorization_comments: "",
  is_walk_in: true,
  is_active: true,
  clinic: "clinic-1",
  clinic_name: "Central Clinic",
  closed_by: null,
  created_by: 9,
  created_by_name: "Dr. Smith",
  encounters: [
    {
      id: 7,
      uuid: "enc-7",
      visit: "visit-41",
      department: "dept-1",
      department_name: "Dental",
      department_type: "dental",
      location: "loc-1",
      location_name: "Room 2",
      clinician: 3,
      clinician_name: "Dr. Kim",
      status: "in_progress",
      billing_mode: "shared_visit",
      started_at: "2026-08-04T10:05:00.000Z",
      ended_at: null,
      notes: "",
      is_active: true,
      created_by: 9,
      created_at: "2026-08-04T10:05:00.000Z",
      updated_at: "2026-08-04T10:05:00.000Z",
    },
  ],
  created_at: "2026-08-04T10:00:00.000Z",
  updated_at: "2026-08-04T10:00:00.000Z",
};

describe("SalesOrderDetailVisitTab", () => {
  beforeEach(() => {
    fetchVisit.mockReset();
  });

  it("shows an empty state when the order has no visit", () => {
    render(
      <SalesOrderDetailVisitTab
        order={{ ...order, visit_uuid: null }}
        isActive
      />,
    );

    expect(screen.getByTestId("sales-order-visit-empty-state")).toBeInTheDocument();
    expect(screen.getByText("No visit linked")).toBeInTheDocument();
  });

  it("renders a flat visit summary instead of a table", async () => {
    fetchVisit.mockResolvedValue(visit);

    render(<SalesOrderDetailVisitTab order={order} isActive />);

    await waitFor(() => {
      expect(screen.getByTestId("sales-order-visit-details")).toBeInTheDocument();
    });

    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(screen.getByText("General consultation")).toBeInTheDocument();
    expect(screen.getByText(/Central Clinic/)).toBeInTheDocument();
    expect(screen.getByText(/Walk-in/)).toBeInTheDocument();
    expect(screen.getByText(/Insurance · MASM - VIP/)).toBeInTheDocument();
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("Dr. Smith")).toBeInTheDocument();
    expect(screen.getByText("AUTH-88")).toBeInTheDocument();
    expect(screen.getByText("Dental")).toBeInTheDocument();
    expect(screen.getByText(/Dr. Kim · Room 2 · Shared visit bill/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View visit" })).toHaveAttribute(
      "href",
      "/visits/visit-41",
    );
  });
});
