import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { EditProductAvailabilityDialog } from "@/features/inventory/components/detail/EditProductAvailabilityDialog";
import type { InventoryProduct } from "@/features/inventory/types/inventory.types";

const updateInventoryProduct = vi.fn();
const toast = vi.fn();

vi.mock("@/providers/toast-provider", () => ({
  useToast: () => ({ toast }),
}));

vi.mock("@/features/inventory/services/inventory.service", () => ({
  updateInventoryProduct: (...args: unknown[]) => updateInventoryProduct(...args),
}));

const serviceProduct = {
  uuid: "svc-1",
  name: "CBC",
  display_name: "CBC",
  default_code: "LAB1",
  barcode: null,
  list_price: 20,
  standard_price: null,
  uom_name: "Test",
  is_active: true,
  product_type: "service",
  sale_ok: true,
  purchase_ok: true,
  metadata: { is_lab_test: true },
} as InventoryProduct;

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("EditProductAvailabilityDialog", () => {
  beforeEach(() => {
    updateInventoryProduct.mockResolvedValue({
      ...serviceProduct,
      purchase_ok: false,
    });
  });

  it("forces purchase_ok false for service products", async () => {
    const onUpdated = vi.fn();

    render(
      <EditProductAvailabilityDialog
        product={serviceProduct}
        open
        onOpenChange={vi.fn()}
        onUpdated={onUpdated}
      />,
    );

    expect(screen.getByTestId("availability-purchase-ok")).toBeDisabled();
    expect(screen.getByTestId("availability-purchase-ok")).not.toBeChecked();
    expect(
      screen.getByText("Service products cannot be purchased."),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("edit-product-availability-save"));

    await waitFor(() => {
      expect(updateInventoryProduct).toHaveBeenCalledWith("svc-1", {
        sale_ok: true,
        purchase_ok: false,
      });
    });
    expect(onUpdated).toHaveBeenCalled();
  });
});
