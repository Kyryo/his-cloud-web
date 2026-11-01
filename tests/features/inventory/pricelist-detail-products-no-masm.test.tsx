import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PricelistDetailProductsTab } from "@/features/inventory/components/detail/PricelistDetailProductsTab";

const fetchProductsMock = vi.hoisted(() => vi.fn());
const useUserMock = vi.hoisted(() => vi.fn());

vi.mock("@/features/catalog/services/catalog.service", () => ({
  fetchCatalogPricelistProducts: fetchProductsMock,
  removeCatalogPricelistProduct: vi.fn(),
  updateCatalogPricelistProduct: vi.fn(),
}));

vi.mock("@/providers/toast-provider", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

vi.mock("@/providers/user-provider", () => ({
  useUser: () => useUserMock(),
}));

vi.mock("@/features/inventory/components/detail/AddPricelistProductDialog", () => ({
  AddPricelistProductDialog: () => null,
}));

vi.mock("@/features/inventory/components/detail/CopyPricelistProductsDialog", () => ({
  CopyPricelistProductsDialog: () => null,
}));

vi.mock("@/features/inventory/components/detail/PricelistCopyJobPanel", () => ({
  PricelistCopyJobPanel: () => null,
}));

vi.mock("@/features/inventory/components/detail/PricelistProductsTable", () => ({
  PricelistProductsTable: () => <div data-testid="pricelist-products-table" />,
}));

const PRICELIST = {
  uuid: "pl-1",
  name: "MASM VIP",
  is_active: true,
  currency_code: "MWK",
};

afterEach(() => {
  cleanup();
});

describe("PricelistDetailProductsTab MASM control", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useUserMock.mockReturnValue({ userData: { is_admin: true } });
    fetchProductsMock.mockResolvedValue({
      results: [
        {
          pricelist_uuid: PRICELIST.uuid,
          product_uuid: "prod-1",
          product_name: "Consult",
          fixed_price: "100",
        },
      ],
      pagination: null,
    });
  });

  it("does not show Update from MASM Core on the products tab", async () => {
    render(<PricelistDetailProductsTab pricelist={PRICELIST} isActive />);

    await waitFor(() => {
      expect(screen.getByTestId("pricelist-products-tab")).toBeInTheDocument();
    });
    expect(screen.queryByText("Update from MASM Core")).not.toBeInTheDocument();
  });
});
