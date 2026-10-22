import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ComponentProps } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DENTAL_WORKSPACE_ROUTING } from "@/features/clinical-dental/constants/dental-workspace-routing";
import { AddClinicalOrderDialog } from "@/features/clinical-opd/components/tabs/AddClinicalOrderDialog";
import { ClinicalWorkspaceConfigProvider } from "@/features/clinical-workspace/components/clinical-workspace-config-context";
import type { ClinicalWorkspaceConfig } from "@/features/clinical-workspace/types/clinical-workspace.types";

const createOrderMutateAsync = vi.fn();
const cancelOrderMutateAsync = vi.fn();
const fetchCatalogProducts = vi.fn();
const toast = vi.fn();

vi.mock("@/providers/toast-provider", () => ({
  useToast: () => ({ toast }),
}));

vi.mock("@/features/clinical-opd/hooks/use-clinical-opd", () => ({
  useCreateOrder: () => ({
    mutateAsync: createOrderMutateAsync,
    isPending: false,
  }),
  useCancelOrder: () => ({
    mutateAsync: cancelOrderMutateAsync,
    isPending: false,
  }),
  useEncounterOrders: () => ({
    data: [
      {
        uuid: "order-existing",
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
}));

vi.mock("@/features/catalog/services/catalog.service", () => ({
  fetchCatalogProducts: (...args: unknown[]) => fetchCatalogProducts(...args),
}));

const DENTAL_CONFIG: ClinicalWorkspaceConfig = {
  ...DENTAL_WORKSPACE_ROUTING,
  panels: {},
};

function renderDialog(
  props: Partial<ComponentProps<typeof AddClinicalOrderDialog>> = {},
  { workspace }: { workspace?: ClinicalWorkspaceConfig } = {},
) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const dialog = (
    <AddClinicalOrderDialog
      visitUuid="visit-1"
      encounterUuid="enc-1"
      capabilities={["order_laboratory", "order_radiology"]}
      open
      onOpenChange={vi.fn()}
      {...props}
    />
  );
  return render(
    <QueryClientProvider client={client}>
      {workspace ? (
        <ClinicalWorkspaceConfigProvider config={workspace}>
          {dialog}
        </ClinicalWorkspaceConfigProvider>
      ) : (
        dialog
      )}
    </QueryClientProvider>,
  );
}

describe("AddClinicalOrderDialog in the dental workspace", () => {
  beforeEach(() => {
    fetchCatalogProducts.mockResolvedValue({
      results: [],
      pagination: { count: 0, next: null, previous: null },
    });
  });

  it("offers radiology and sundries only and opens on radiology", async () => {
    renderDialog(
      {
        capabilities: [
          "order_laboratory",
          "order_radiology",
          "order_procedure",
          "order_sundry",
        ],
      },
      { workspace: DENTAL_CONFIG },
    );

    expect(screen.getByTestId("tabbed-dialog-tab-radiology")).toBeInTheDocument();
    expect(screen.getByTestId("tabbed-dialog-tab-sundries")).toBeInTheDocument();
    expect(screen.queryByTestId("tabbed-dialog-tab-lab")).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("tabbed-dialog-tab-procedures"),
    ).not.toBeInTheDocument();
    await waitFor(() =>
      expect(fetchCatalogProducts).toHaveBeenCalledWith(
        expect.objectContaining({ is_radiology: true }),
      ),
    );
    expect(fetchCatalogProducts).not.toHaveBeenCalledWith(
      expect.objectContaining({ is_lab_test: true }),
    );
  });
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("AddClinicalOrderDialog product list", () => {
  beforeEach(() => {
    fetchCatalogProducts.mockResolvedValue({
      results: [
        {
          uuid: "lab-1",
          name: "CBC",
          display_name: "CBC",
          default_code: "LAB001",
          uom_name: "Test",
          barcode: null,
          list_price: 10,
          standard_price: null,
          is_active: true,
          product_type: "service",
          metadata: { is_lab_test: true },
        },
        {
          uuid: "lab-2",
          name: "Pregnancy test",
          display_name: "Pregnancy test",
          default_code: "LAB002",
          uom_name: "Test",
          barcode: null,
          list_price: 8,
          standard_price: null,
          is_active: true,
          product_type: "service",
          metadata: { is_lab_test: true },
        },
      ],
      pagination: { count: 2, next: null, previous: null },
    });
    createOrderMutateAsync.mockResolvedValue({
      uuid: "order-1",
      product_uuid: "lab-2",
    });
    cancelOrderMutateAsync.mockResolvedValue({ uuid: "order-existing" });
  });

  it("shows check and cancel for already ordered products", async () => {
    renderDialog();

    expect(await screen.findByText("CBC")).toBeInTheDocument();
    expect(
      screen.getByTestId("clinical-order-product-ordered-lab-1"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("clinical-order-product-cancel-lab-1"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("clinical-order-product-plus-lab-2"),
    ).toBeInTheDocument();
  });

  it("places a new order and cancels an existing one from the dialog", async () => {
    renderDialog();

    await screen.findByText("Pregnancy test");
    fireEvent.click(screen.getByTestId("clinical-order-product-plus-lab-2"));

    await waitFor(() => {
      expect(createOrderMutateAsync).toHaveBeenCalledWith({
        item_type: "LABORATORY",
        description: "Pregnancy test",
        product_uuid: "lab-2",
        clinical_quantity: 1,
        clinical_uom: "Test",
        charge_quantity: 1,
      });
    });

    fireEvent.click(screen.getByTestId("clinical-order-product-cancel-lab-1"));

    await waitFor(() => {
      expect(cancelOrderMutateAsync).toHaveBeenCalledWith("order-existing");
    });
  });

  it("shows an empty state on tabs the user cannot order", async () => {
    renderDialog({ capabilities: ["order_laboratory"] });

    await screen.findByText("CBC");

    fireEvent.click(screen.getByTestId("tabbed-dialog-tab-radiology"));

    expect(
      await screen.findByTestId("clinical-order-capability-empty"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("No radiology order privilege"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("tabbed-dialog-tab-radiology")).not.toBeDisabled();
    expect(fetchCatalogProducts).not.toHaveBeenCalledWith(
      expect.objectContaining({ is_radiology: true }),
    );
  });

  it("shows allergy alerts as a warning and still places the order", async () => {
    createOrderMutateAsync.mockResolvedValue({
      uuid: "order-2",
      product_uuid: "lab-2",
      allergy_alerts: [
        {
          allergy_name: "Latex",
          severity: "moderate",
          match: "gloves",
        },
      ],
    });

    renderDialog({ capabilities: ["order_laboratory"] });

    await screen.findByText("Pregnancy test");
    fireEvent.click(screen.getByTestId("clinical-order-product-plus-lab-2"));

    await waitFor(() => {
      expect(createOrderMutateAsync).toHaveBeenCalled();
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Order placed with allergy warning",
          variant: "warning",
          description: "Latex (moderate)",
        }),
      );
    });
  });
});
