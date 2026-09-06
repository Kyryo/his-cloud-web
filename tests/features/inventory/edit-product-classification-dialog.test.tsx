import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { EditProductClassificationDialog } from "@/features/inventory/components/detail/EditProductClassificationDialog";
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
  uuid: "prod-1",
  name: "Wound Dressing",
  display_name: "Wound Dressing",
  default_code: "PROC1",
  barcode: null,
  list_price: 10,
  standard_price: null,
  uom_name: "Unit",
  is_active: true,
  product_type: "service",
  metadata: {
    is_procedure: true,
    opd_only_procedure: true,
  },
} as InventoryProduct;

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("EditProductClassificationDialog", () => {
  beforeEach(() => {
    updateInventoryProduct.mockResolvedValue({
      ...serviceProduct,
      metadata: {
        is_procedure: true,
        dental_only_procedure: true,
      },
    });
  });

  it("expands procedure scopes and saves the selected classification", async () => {
    const onUpdated = vi.fn();
    const onOpenChange = vi.fn();

    render(
      <EditProductClassificationDialog
        product={serviceProduct}
        open
        onOpenChange={onOpenChange}
        onUpdated={onUpdated}
      />,
    );

    expect(screen.getByText("Procedure scope")).toBeInTheDocument();
    fireEvent.click(
      screen.getByTestId("classification-procedure-scope-dental_only"),
    );
    fireEvent.click(screen.getByTestId("edit-product-classification-save"));

    await waitFor(() => {
      expect(updateInventoryProduct).toHaveBeenCalledWith(
        "prod-1",
        expect.objectContaining({
          is_procedure: true,
          dental_only_procedure: true,
          opd_only_procedure: false,
          is_lab_test: false,
          is_radiology: false,
        }),
      );
    });
    expect(onUpdated).toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
