import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import { OhEmployeesTable } from "@/features/occupational-health/components/OhEmployeesTable";
import type { Customer } from "@/features/customers/types/customer.types";

const mockToast = vi.fn();

vi.mock("@/providers/toast-provider", () => ({
  useToast: () => ({
    toast: mockToast,
    dismiss: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  }),
}));

vi.mock("@/components/UserIdenticon", () => ({
  UserIdenticon: ({ name }: { name: string }) => (
    <div data-testid="user-identicon">{name}</div>
  ),
}));

const MOCK_EMPLOYEES: Customer[] = [
  {
    id: 1,
    uuid: "emp-uuid-1",
    tenant: 1,
    first_name: "Tadala",
    middle_name: null,
    last_name: "Banda",
    full_name: "Tadala Banda",
    customer_identifier: "MRN-5001",
    internal_reference: "",
    phone_number: "+265999123456",
    email: "tadala@example.com",
    patient_uuid: "patient-1",
    gender: "Female",
    dob: "1994-04-12",
    dob_is_estimated: false,
    age: 32,
    has_synced_to_openmrs: false,
    is_active: true,
    visit_status: "active",
    oh_employer_name: "Mine Co",
    oh_hazard_profile_name: "Surface risk",
    created_at: "2026-08-15T08:30:00Z",
    updated_at: "2026-08-15T08:30:00Z",
    created_by: 1,
  },
];

describe("OhEmployeesTable", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders employer and risk profile columns without visit status or actions", () => {
    render(<OhEmployeesTable customers={MOCK_EMPLOYEES} />);

    expect(screen.getByText("Client")).toBeInTheDocument();
    expect(screen.getByText("Client ID / MRN")).toBeInTheDocument();
    expect(screen.getByText("Employer")).toBeInTheDocument();
    expect(screen.getByText("Risk profile")).toBeInTheDocument();
    expect(screen.getByText("Demographics")).toBeInTheDocument();
    expect(screen.getByText("Registered")).toBeInTheDocument();

    expect(screen.queryByText("Visit Status")).not.toBeInTheDocument();
    expect(screen.queryByText("Actions")).not.toBeInTheDocument();

    expect(screen.getByText("Mine Co")).toBeInTheDocument();
    expect(screen.getByText("Surface risk")).toBeInTheDocument();
  });

  it("invokes onRowClick when a row is clicked", () => {
    const onRowClick = vi.fn();
    render(
      <OhEmployeesTable customers={MOCK_EMPLOYEES} onRowClick={onRowClick} />,
    );

    fireEvent.click(screen.getByText("Mine Co"));
    expect(onRowClick).toHaveBeenCalledWith(MOCK_EMPLOYEES[0]);
  });
});
