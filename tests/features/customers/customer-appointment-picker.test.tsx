import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CustomerAppointmentPicker } from "@/features/customers/components/CustomerAppointmentPicker";
import type { Customer } from "@/features/customers/types/customer.types";

const { fetchCustomers } = vi.hoisted(() => ({
  fetchCustomers: vi.fn(),
}));

vi.mock("@/features/customers/services/customers.service", () => ({
  fetchCustomers,
}));

function makeCustomer(overrides: Partial<Customer> = {}): Customer {
  return {
    id: 1,
    uuid: "cust-1",
    tenant: 1,
    first_name: "Ada",
    middle_name: null,
    last_name: "Lovelace",
    full_name: "Ada Lovelace",
    customer_identifier: "CLINIC-0001",
    internal_reference: "",
    phone_number: null,
    email: null,
    patient_uuid: "p-1",
    gender: "Female",
    dob: "1990-01-01",
    dob_is_estimated: false,
    age: 36,
    has_synced_to_openmrs: false,
    is_active: true,
    visit_status: "not_started",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    created_by: null,
    ...overrides,
  };
}

afterEach(() => {
  cleanup();
});

describe("CustomerAppointmentPicker", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchCustomers.mockResolvedValue({
      results: [makeCustomer()],
      pagination: { count: 1, next: null, previous: null },
    });
  });

  it("offers create when the typed name is not an exact match", async () => {
    const onCreateClient = vi.fn();

    render(
      <CustomerAppointmentPicker
        customer={null}
        onCustomerChange={() => undefined}
        onCreateClient={onCreateClient}
      />,
    );

    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.change(screen.getByPlaceholderText("Name, identifier, or phone"), {
      target: { value: "Tahir" },
    });

    await waitFor(() => {
      expect(screen.getByText('Create “Tahir”')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Create “Tahir”'));
    expect(onCreateClient).toHaveBeenCalledWith("Tahir");
  });
});
