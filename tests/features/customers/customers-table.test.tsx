import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import { CustomersTable } from "@/features/customers/components/CustomersTable";
import type { Customer } from "@/features/customers/types/customer.types";

const mockPush = vi.fn();
const mockToast = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

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

const MOCK_CUSTOMERS: Customer[] = [
  {
    id: 1,
    uuid: "cust-uuid-1",
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
    created_at: "2026-08-15T08:30:00Z",
    updated_at: "2026-08-15T08:30:00Z",
    created_by: 1,
  },
  {
    id: 2,
    uuid: "cust-uuid-2",
    tenant: 1,
    first_name: "Kondwani",
    middle_name: null,
    last_name: "Phiri",
    full_name: "Kondwani Phiri",
    customer_identifier: "MRN-5002",
    internal_reference: "",
    phone_number: null,
    email: null,
    patient_uuid: "patient-2",
    gender: "Male",
    dob: "1988-11-20",
    dob_is_estimated: false,
    age: 37,
    has_synced_to_openmrs: false,
    is_active: true,
    visit_status: "completed",
    created_at: "2026-08-10T10:00:00Z",
    updated_at: "2026-08-10T10:00:00Z",
    created_by: 1,
  },
];

describe("CustomersTable", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders customer table headers and customer rows with interactive elements", () => {
    render(<CustomersTable customers={MOCK_CUSTOMERS} />);

    expect(screen.getByText("Client")).toBeInTheDocument();
    expect(screen.getByText("Client ID / MRN")).toBeInTheDocument();
    expect(screen.getByText("Visit Status")).toBeInTheDocument();
    expect(screen.getByText("Demographics")).toBeInTheDocument();
    expect(screen.getByText("Registered")).toBeInTheDocument();
    expect(screen.getByText("Actions")).toBeInTheDocument();

    expect(screen.getAllByText("Tadala Banda").length).toBeGreaterThan(0);
    expect(screen.getByText("MRN-5001")).toBeInTheDocument();
    expect(screen.getByText("+265999123456")).toBeInTheDocument();
    expect(screen.getByText("32 yrs")).toBeInTheDocument();

    expect(screen.getAllByText("Kondwani Phiri").length).toBeGreaterThan(0);
    expect(screen.getByText("MRN-5002")).toBeInTheDocument();
    expect(screen.getByText("37 yrs")).toBeInTheDocument();
  });

  it("calls onRowClick when a customer row is clicked", () => {
    const onRowClick = vi.fn();

    render(<CustomersTable customers={MOCK_CUSTOMERS} onRowClick={onRowClick} />);

    const row = screen.getByText("MRN-5001").closest("tr");
    expect(row).not.toBeNull();
    if (row) {
      fireEvent.click(row);
      expect(onRowClick).toHaveBeenCalledWith(MOCK_CUSTOMERS[0]);
    }
  });

  it("handles start visit and active visit action buttons", () => {
    const onStartVisit = vi.fn();

    render(
      <CustomersTable
        customers={MOCK_CUSTOMERS}
        onStartVisit={onStartVisit}
      />,
    );

    // Active visit button for customer 1
    const activeVisitBtn = screen.getByRole("button", { name: /Active Visit/i });
    expect(activeVisitBtn).toBeInTheDocument();
    fireEvent.click(activeVisitBtn);
    expect(onStartVisit).toHaveBeenCalledWith(MOCK_CUSTOMERS[0]);

    // Start visit icon button for customer 2 (completed visit)
    const startVisitBtn = screen.getByRole("button", { name: "Start visit" });
    expect(startVisitBtn).toBeInTheDocument();
    fireEvent.click(startVisitBtn);
    expect(onStartVisit).toHaveBeenCalledWith(MOCK_CUSTOMERS[1]);
  });
});
