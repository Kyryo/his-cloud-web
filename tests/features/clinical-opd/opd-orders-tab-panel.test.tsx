import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { OpdOrdersTabPanel } from "@/features/clinical-opd/components/tabs/OpdOrdersTabPanel";

const createOrderMutateAsync = vi.hoisted(() => vi.fn());
const toast = vi.hoisted(() => vi.fn());

vi.mock("@/providers/toast-provider", () => ({
  useToast: () => ({ toast }),
}));

vi.mock(
  "@/features/clinical-opd/components/detail/opd-encounter-workspace-context",
  () => ({
    useOpdEncounterWorkspace: () => ({
      capabilities: ["order_laboratory"],
      encounter: { started_at: "2026-09-05T10:00:00Z" },
    }),
  }),
);

vi.mock("@/features/clinical-opd/hooks/use-clinical-opd", () => ({
  useEncounterOrders: () => ({
    data: [
      {
        uuid: "order-1",
        item_type: "LABORATORY",
        item_type_display: "Laboratory",
        description: "CBC",
        clinical_quantity: "1",
        clinical_uom: "Test",
        charge_quantity: "1",
        quantity: "1",
        status: "ORDERED",
        status_display: "Ordered",
        ordered_at: "2026-09-05T10:05:00Z",
        product: 12,
        product_uuid: "lab-1",
        created_by_name: "Dr. Ada",
        is_active: true,
      },
    ],
    isLoading: false,
  }),
  useCancelOrder: () => ({
    mutateAsync: vi.fn(),
  }),
  useCreateOrder: () => ({
    mutateAsync: createOrderMutateAsync,
    isPending: false,
  }),
}));

vi.mock("@/features/clinical-opd/components/tabs/AddClinicalOrderDialog", () => ({
  AddClinicalOrderDialog: () => null,
}));

vi.mock("@/features/clinical-opd/components/detail/OpdPhysicianTabShell", () => ({
  OpdPhysicianTabShell: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("OpdOrdersTabPanel", () => {
  beforeEach(() => {
    createOrderMutateAsync.mockResolvedValue({ uuid: "order-2" });
  });

  it("renders dual clinical and charge quantities", () => {
    render(
      <OpdOrdersTabPanel visitUuid="visit-1" encounterUuid="enc-1" />,
    );

    expect(screen.getByText("Clinical orders")).toBeInTheDocument();
    expect(screen.getByText("CBC")).toBeInTheDocument();
    expect(
      screen.getByText(/Clinical units: 1 Test · Charged units: 1/),
    ).toBeInTheDocument();
    expect(screen.getByTestId("opd-orders-add-button")).toBeInTheDocument();
    expect(screen.getByTestId("opd-orders-type-filters")).toBeInTheDocument();
    expect(screen.getByLabelText("Created by Dr. Ada")).toBeInTheDocument();
    expect(screen.getByTestId("opd-orders-reorder-order-1")).toBeInTheDocument();
  });

  it("filters orders by type using button tabs", () => {
    render(
      <OpdOrdersTabPanel visitUuid="visit-1" encounterUuid="enc-1" />,
    );

    expect(screen.getByText("CBC")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("opd-orders-filter-radiology"));
    expect(screen.queryByText("CBC")).not.toBeInTheDocument();
    expect(
      screen.getByText(/No radiology orders for this encounter/),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("opd-orders-filter-laboratory"));
    expect(screen.getByText("CBC")).toBeInTheDocument();
  });

  it("confirms before adding another order of the same product", async () => {
    render(
      <OpdOrdersTabPanel visitUuid="visit-1" encounterUuid="enc-1" />,
    );

    fireEvent.click(screen.getByTestId("opd-orders-reorder-order-1"));
    expect(
      await screen.findByTestId("confirm-reorder-clinical-order-dialog"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Do you want to place another Laboratory order for CBC/),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByTestId("confirm-reorder-clinical-order-confirm"),
    );

    await waitFor(() => {
      expect(createOrderMutateAsync).toHaveBeenCalledWith({
        item_type: "LABORATORY",
        description: "CBC",
        product_uuid: "lab-1",
        clinical_quantity: 1,
        clinical_uom: "Test",
        charge_quantity: 1,
      });
    });
  });
});
