import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AddClinicalOrderDialog } from "@/features/clinical-opd/components/tabs/AddClinicalOrderDialog";

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
    render(
      <AddClinicalOrderDialog
        visitUuid="visit-1"
        encounterUuid="enc-1"
        capabilities={["order_laboratory", "order_radiology"]}
        open
        onOpenChange={vi.fn()}
      />,
    );

    expect(await screen.findByText("CBC (LAB001)")).toBeInTheDocument();
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
    render(
      <AddClinicalOrderDialog
        visitUuid="visit-1"
        encounterUuid="enc-1"
        capabilities={["order_laboratory", "order_radiology"]}
        open
        onOpenChange={vi.fn()}
      />,
    );

    await screen.findByText("Pregnancy test (LAB002)");
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
    render(
      <AddClinicalOrderDialog
        visitUuid="visit-1"
        encounterUuid="enc-1"
        capabilities={["order_laboratory"]}
        open
        onOpenChange={vi.fn()}
      />,
    );

    await screen.findByText("CBC (LAB001)");

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
});
