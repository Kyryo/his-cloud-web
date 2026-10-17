import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { UpdateCustomerDialog } from "@/features/customers/components/UpdateCustomerDialog";
import type { Customer } from "@/features/customers/types/customer.types";

vi.mock("@/providers/toast-provider", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

const customer = {
  id: 1,
  uuid: "11111111-1111-1111-1111-111111111111",
  tenant: 1,
  first_name: "Amina",
  middle_name: null,
  last_name: "Banda",
  full_name: "Amina Banda",
  customer_identifier: "C-1",
  internal_reference: "",
  phone_number: null,
  email: null,
  patient_uuid: "22222222-2222-2222-2222-222222222222",
  gender: "Female",
  dob: "1990-01-01",
  dob_is_estimated: false,
  age: 36,
  has_synced_to_openmrs: false,
  is_active: true,
  visit_status: "none",
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
  created_by: null,
} as Customer;

afterEach(() => {
  cleanup();
});

describe("UpdateCustomerDialog", () => {
  it("keeps the title and actions fixed while the form scrolls", () => {
    render(
      <UpdateCustomerDialog
        customer={customer}
        open
        onOpenChange={vi.fn()}
        onUpdated={vi.fn()}
      />,
    );

    const dialog = screen.getByTestId("update-customer-dialog");
    const form = screen.getByTestId("update-customer-form");
    const submit = screen.getByTestId("update-customer-submit");

    expect(screen.getByRole("heading", { name: "Update client" })).toBeInTheDocument();
    expect(dialog).toHaveClass("flex-col", "overflow-hidden");
    expect(form.contains(submit)).toBe(false);
    expect(dialog.contains(submit)).toBe(true);
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
  });
});
