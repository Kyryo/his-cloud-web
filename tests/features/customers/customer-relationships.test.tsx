import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AddCustomerRelationshipDialog } from "@/features/customers/components/detail/AddCustomerRelationshipDialog";
import { CustomerDetailRelationshipsTab } from "@/features/customers/components/detail/CustomerDetailRelationshipsTab";
import type { Customer } from "@/features/customers/types/customer.types";

const {
  toast,
  fetchCustomerRelationships,
  createCustomerRelationship,
  archiveCustomerRelationship,
} = vi.hoisted(() => ({
  toast: vi.fn(),
  fetchCustomerRelationships: vi.fn(),
  createCustomerRelationship: vi.fn(),
  archiveCustomerRelationship: vi.fn(),
}));

vi.mock("@/providers/toast-provider", () => ({
  useToast: () => ({ toast }),
}));

vi.mock("@/features/customers/services/customer-relationships.service", () => ({
  fetchCustomerRelationships,
  createCustomerRelationship,
  archiveCustomerRelationship,
}));

vi.mock("@/features/customers/components/CustomerAppointmentPicker", () => ({
  CustomerAppointmentPicker: ({
    onCustomerChange,
  }: {
    customer: Customer | null;
    onCustomerChange: (customer: Customer | null) => void;
  }) => (
    <button
      type="button"
      data-testid="mock-related-client-picker"
      onClick={() =>
        onCustomerChange({
          uuid: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
          first_name: "Bea",
          last_name: "Spouse",
        } as Customer)
      }
    >
      Select related client
    </button>
  ),
}));

const customer = {
  id: 1,
  uuid: "57136727-9e05-4ae3-9146-149106022595",
  first_name: "Ada",
  last_name: "Banda",
} as Customer;

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("CustomerDetailRelationshipsTab", () => {
  beforeEach(() => {
    fetchCustomerRelationships.mockResolvedValue({ results: [] });
  });

  it("shows an empty state when there are no relationships", async () => {
    render(
      <CustomerDetailRelationshipsTab customer={customer} isActive />,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId("customer-relationships-empty"),
      ).toBeInTheDocument();
    });
    expect(screen.getByText("No relationships yet")).toBeInTheDocument();
    expect(fetchCustomerRelationships).toHaveBeenCalledWith(customer.uuid);
  });

  it("opens the add dialog from the empty state action", async () => {
    render(
      <CustomerDetailRelationshipsTab customer={customer} isActive />,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId("customer-relationships-empty"),
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("add-customer-relationship-button"));

    expect(
      screen.getByTestId("add-customer-relationship-dialog"),
    ).toBeInTheDocument();
  });

  it("lists linked clients when relationships exist", async () => {
    fetchCustomerRelationships.mockResolvedValue({
      results: [
        {
          id: 1,
          uuid: "rel-1",
          tenant: 1,
          principal: 1,
          principal_uuid: customer.uuid,
          principal_name: "Ada Banda",
          principal_identifier: "CL-1",
          related: 2,
          related_uuid: "related-uuid",
          related_name: "Bea Spouse",
          related_identifier: "CL-2",
          relationship: "SPOUSE",
          notes: "",
          direction: "outgoing",
          is_active: true,
          created_at: "2026-01-01T00:00:00Z",
          updated_at: "2026-01-01T00:00:00Z",
          created_by: null,
          created_by_name: "",
        },
      ],
    });

    render(
      <CustomerDetailRelationshipsTab customer={customer} isActive />,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId("customer-relationships-table"),
      ).toBeInTheDocument();
    });
    expect(screen.getByText("Bea Spouse")).toBeInTheDocument();
    expect(screen.getByText("Spouse")).toBeInTheDocument();
  });
});

describe("AddCustomerRelationshipDialog", () => {
  beforeEach(() => {
    createCustomerRelationship.mockResolvedValue({
      uuid: "rel-new",
      relationship: "CHILD",
      direction: "outgoing",
    });
  });

  it("requires a related client before saving", async () => {
    render(
      <AddCustomerRelationshipDialog
        customer={customer}
        open
        onOpenChange={vi.fn()}
        onCreated={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Save relationship" }));

    await waitFor(() => {
      expect(screen.getByText("Select a client")).toBeInTheDocument();
    });
    expect(createCustomerRelationship).not.toHaveBeenCalled();
  });

  it("saves when a related client and relationship are selected", async () => {
    const onCreated = vi.fn();
    const onOpenChange = vi.fn();

    render(
      <AddCustomerRelationshipDialog
        customer={customer}
        open
        onOpenChange={onOpenChange}
        onCreated={onCreated}
      />,
    );

    fireEvent.click(screen.getByTestId("mock-related-client-picker"));
    fireEvent.click(screen.getByRole("button", { name: "Save relationship" }));

    await waitFor(() => {
      expect(createCustomerRelationship).toHaveBeenCalledWith(
        customer.uuid,
        expect.objectContaining({
          related: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
          relationship: "SPOUSE",
        }),
      );
    });
    expect(onCreated).toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
