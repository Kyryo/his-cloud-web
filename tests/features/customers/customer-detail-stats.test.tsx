import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CustomerDetailHeader } from "@/features/customers/components/detail/CustomerDetailHeader";
import { CustomerInvoicePaymentStatsCards } from "@/features/customers/components/detail/CustomerInvoicePaymentStatsCards";
import type { CustomerInvoicesStats } from "@/features/customers/types/customer-billing.types";
import type { Customer } from "@/features/customers/types/customer.types";

const mockCustomer: Customer = {
  id: 101,
  uuid: "cust-101",
  patient_uuid: "pat-101",
  customer_identifier: "MRN-1001",
  first_name: "Thoko",
  last_name: "Phiri",
  middle_name: null,
  gender: "Female",
  dob: "1994-05-15",
  dob_is_estimated: false,
  phone_number: "+265991234567",
  email: "thoko.phiri@example.com",
  is_active: true,
  visit_status: "active",
  internal_reference: "REF-001",
  opening_balance: "0.00",
  tags: [],
  created_at: "2026-01-10T08:00:00Z",
  updated_at: "2026-01-10T08:00:00Z",
};

describe("CustomerDetailHeader", () => {
  it("renders patient identity, badges, identifier, and active visit status", () => {
    render(<CustomerDetailHeader customer={mockCustomer} />);

    expect(screen.getByText("Thoko Phiri")).toBeInTheDocument();
    expect(screen.getByText("MRN-1001")).toBeInTheDocument();
    expect(screen.getByText("Female")).toBeInTheDocument();
    expect(screen.getByText(/Active visit/i)).toBeInTheDocument();
    expect(screen.getByText("+265991234567")).toBeInTheDocument();
    expect(screen.getByText("thoko.phiri@example.com")).toBeInTheDocument();
    expect(screen.getByText("REF-001")).toBeInTheDocument();
  });
});

describe("CustomerInvoicePaymentStatsCards", () => {
  it("renders cardless stat strip with counts and formatted amounts", () => {
    const mockStats: CustomerInvoicesStats = {
      all: { count: 8, total: "240000.00" },
      paid: { count: 5, total: "180000.00" },
      not_paid: { count: 2, total: "40000.00" },
      partially_paid: { count: 1, total: "20000.00" },
    };

    render(<CustomerInvoicePaymentStatsCards stats={mockStats} />);

    expect(screen.getByText("All invoices")).toBeInTheDocument();
    expect(screen.getByText("8")).toBeInTheDocument();
    expect(screen.getByText("Paid")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("Unpaid")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("Partially paid")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
  });
});
