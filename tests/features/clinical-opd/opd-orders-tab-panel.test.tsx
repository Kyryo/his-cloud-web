import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DENTAL_WORKSPACE_ROUTING } from "@/features/clinical-dental/constants/dental-workspace-routing";
import { OpdOrdersTabPanel } from "@/features/clinical-opd/components/tabs/OpdOrdersTabPanel";
import { ClinicalWorkspaceConfigProvider } from "@/features/clinical-workspace/components/clinical-workspace-config-context";
import type { ClinicalWorkspaceConfig } from "@/features/clinical-workspace/types/clinical-workspace.types";

const createOrderMutateAsync = vi.hoisted(() => vi.fn());
const toast = vi.hoisted(() => vi.fn());
const ordersState = vi.hoisted(() => ({
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
  ] as Array<Record<string, unknown>>,
}));

vi.mock("@/providers/toast-provider", () => ({
  useToast: () => ({ toast }),
}));

vi.mock(
  "@/features/clinical-opd/components/detail/opd-encounter-workspace-context",
  () => ({
    useOpdEncounterWorkspace: () => ({
      capabilities: ["order_laboratory"],
      encounter: { started_at: "2026-09-05T10:00:00Z" },
      chartSummary: { investigation_orders: [] },
      isChartLocked: false,
    }),
  }),
);

vi.mock("@/features/clinical-opd/hooks/use-clinical-opd", () => ({
  useEncounterOrders: () => ({
    data: ordersState.data,
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

vi.mock(
  "@/features/clinical-opd/components/detail/OpdClinicalHistoryPanel",
  () => ({
    OpdClinicalHistoryPanel: () => (
      <aside data-testid="opd-clinical-history-panel" />
    ),
  }),
);

vi.mock("@/features/clinical-opd/components/tabs/AddClinicalOrderDialog", () => ({
  AddClinicalOrderDialog: () => null,
}));

vi.mock("@/features/clinical-opd/components/tabs/ReferLabOrdersDialog", () => ({
  ReferLabOrdersDialog: () => null,
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("OpdOrdersTabPanel", () => {
  beforeEach(() => {
    createOrderMutateAsync.mockResolvedValue({ uuid: "order-2" });
    ordersState.data = [
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
    ];
  });

  it("renders encounter orders without add-order actions", () => {
    render(
      <OpdOrdersTabPanel visitUuid="visit-1" encounterUuid="enc-1" />,
    );

    expect(screen.getByText("CBC")).toBeInTheDocument();
    expect(screen.getByText("Ordered")).toBeInTheDocument();
    expect(
      screen.getByTestId("opd-orders-item-order-1"),
    ).toHaveTextContent("Lab");
    expect(screen.queryByTestId("opd-orders-add-button")).not.toBeInTheDocument();
    expect(screen.getByTestId("opd-orders-type-filters")).toBeInTheDocument();
    expect(screen.getByTestId("opd-orders-reorder-order-1")).toBeInTheDocument();
    expect(screen.getByTestId("opd-orders-cancel-order-1")).toBeInTheDocument();
    expect(screen.getByTestId("opd-orders-item-order-1")).toHaveTextContent(
      "Dr. Ada",
    );
    expect(
      screen.queryByTestId("opd-investigation-orders"),
    ).not.toBeInTheDocument();
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

  it("filters dental orders by radiology and sundries only", () => {
    ordersState.data = [
      {
        uuid: "order-rad",
        item_type: "RADIOLOGY",
        item_type_display: "Radiology",
        description: "OPG",
        clinical_quantity: "1",
        clinical_uom: "Study",
        charge_quantity: "1",
        quantity: "1",
        status: "ORDERED",
        status_display: "Ordered",
        ordered_at: "2026-09-05T10:05:00Z",
        product: 12,
        product_uuid: "rad-1",
        created_by_name: "Dr. Ada",
        is_active: true,
      },
      {
        uuid: "order-proc",
        item_type: "PROCEDURE",
        item_type_display: "Procedure",
        description: "Extraction billed from treatment",
        clinical_quantity: "1",
        clinical_uom: "Unit",
        charge_quantity: "1",
        quantity: "1",
        status: "ORDERED",
        status_display: "Ordered",
        ordered_at: "2026-09-05T10:06:00Z",
        product: 13,
        product_uuid: "proc-1",
        created_by_name: "Dr. Ada",
        is_active: true,
      },
      {
        uuid: "order-lab",
        item_type: "LABORATORY",
        item_type_display: "Laboratory",
        description: "CBC",
        clinical_quantity: "1",
        clinical_uom: "Test",
        charge_quantity: "1",
        quantity: "1",
        status: "ORDERED",
        status_display: "Ordered",
        ordered_at: "2026-09-05T10:07:00Z",
        product: 14,
        product_uuid: "lab-1",
        created_by_name: "Dr. Ada",
        is_active: true,
      },
    ];

    render(
      <ClinicalWorkspaceConfigProvider
        config={{ ...DENTAL_WORKSPACE_ROUTING, panels: {} } as ClinicalWorkspaceConfig}
      >
        <OpdOrdersTabPanel visitUuid="visit-1" encounterUuid="enc-1" />
      </ClinicalWorkspaceConfigProvider>,
    );

    expect(screen.getByTestId("opd-orders-filter-all")).toBeInTheDocument();
    expect(screen.getByTestId("opd-orders-filter-radiology")).toBeInTheDocument();
    expect(screen.getByTestId("opd-orders-filter-sundry")).toBeInTheDocument();
    expect(
      screen.queryByTestId("opd-orders-filter-laboratory"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("opd-orders-filter-procedure"),
    ).not.toBeInTheDocument();
    expect(screen.getByText("OPG")).toBeInTheDocument();
    expect(
      screen.queryByText("Extraction billed from treatment"),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("CBC")).not.toBeInTheDocument();
    expect(screen.getByTestId("opd-consult-form-locked")).toBeInTheDocument();
  });
});
