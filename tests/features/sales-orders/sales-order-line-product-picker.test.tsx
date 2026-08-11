import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SalesOrderLineProductPicker } from "@/features/sales-orders/components/detail/SalesOrderLineProductPicker";
import type { InventoryProduct } from "@/features/inventory/types/inventory.types";

const searchInventoryProducts = vi.fn();
const fetchCatalogPricelistProducts = vi.fn();

vi.mock("@/features/inventory/services/inventory.service", () => ({
  searchInventoryProducts: (...args: unknown[]) =>
    searchInventoryProducts(...args),
}));

vi.mock("@/features/catalog/services/catalog.service", () => ({
  fetchCatalogPricelistProducts: (...args: unknown[]) =>
    fetchCatalogPricelistProducts(...args),
}));

const PRODUCT: InventoryProduct = {
  uuid: "prod-uuid-1",
  name: "Consultation",
  display_name: "Consultation",
  default_code: "CONS-001",
  barcode: null,
  list_price: "100.00",
  standard_price: null,
  uom_name: null,
  is_active: true,
};

beforeEach(() => {
  vi.clearAllMocks();
  searchInventoryProducts.mockResolvedValue([PRODUCT]);
  fetchCatalogPricelistProducts.mockResolvedValue({ results: [] });
});

afterEach(() => {
  cleanup();
});

describe("SalesOrderLineProductPicker", () => {
  it("searches all active products and never scopes to pricelist memberships", async () => {
    render(
      <SalesOrderLineProductPicker
        id="so-line-product-test"
        value={null}
        autoOpen
        onSelect={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByPlaceholderText("Search products..."), {
      target: { value: "cons" },
    });

    await waitFor(() => {
      expect(searchInventoryProducts).toHaveBeenCalledWith({
        q: "cons",
        active: true,
      });
    });

    expect(fetchCatalogPricelistProducts).not.toHaveBeenCalled();
    expect(
      await screen.findByText("Consultation (CONS-001)"),
    ).toBeInTheDocument();
  });

  it("keeps searching the product catalog for longer queries", async () => {
    render(
      <SalesOrderLineProductPicker
        id="so-line-product-test"
        value={null}
        autoOpen
        onSelect={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByPlaceholderText("Search products..."), {
      target: { value: "paracetamol" },
    });

    await waitFor(() => {
      expect(searchInventoryProducts).toHaveBeenCalledWith({
        q: "paracetamol",
        active: true,
      });
    });

    expect(fetchCatalogPricelistProducts).not.toHaveBeenCalled();
  });
});
