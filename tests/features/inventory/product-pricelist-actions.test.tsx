import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ProductPricelistActions } from "@/features/inventory/components/detail/ProductPricelistActions";
import type { InventoryProduct } from "@/features/inventory/types/inventory.types";

const fetchOrganizationPricelistsMock = vi.hoisted(() => vi.fn());
const toastMock = vi.hoisted(() => vi.fn());

vi.mock("@/features/settings/services/settings.service", () => ({
  fetchOrganizationPricelists: fetchOrganizationPricelistsMock,
}));

vi.mock("@/providers/toast-provider", () => ({
  useToast: () => ({ toast: toastMock }),
}));

const PRODUCT: InventoryProduct = {
  uuid: "11111111-1111-1111-1111-111111111111",
  name: "Consultation",
  display_name: "Consultation",
  default_code: "CONS",
  barcode: null,
  list_price: "25.00",
  standard_price: "0",
  uom_name: "Unit",
  is_active: true,
};

const CASH_UUID = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
const INSURANCE_UUID = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";
const ARCHIVED_UUID = "cccccccc-cccc-cccc-cccc-cccccccccccc";

afterEach(() => {
  cleanup();
});

describe("ProductPricelistActions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchOrganizationPricelistsMock.mockResolvedValue({
      results: [
        { uuid: CASH_UUID, name: "Cash", is_active: true, currency_code: "MWK" },
        {
          uuid: INSURANCE_UUID,
          name: "Insurance",
          is_active: true,
          currency_code: "MWK",
        },
        {
          uuid: ARCHIVED_UUID,
          name: "Archived",
          is_active: false,
          currency_code: "MWK",
        },
      ],
      pagination: { count: 3, next: null, previous: null },
    });
  });

  it("keeps add to all enabled when remaining active pricelists exist", async () => {
    render(
      <ProductPricelistActions
        product={PRODUCT}
        existingItems={[{ pricelist_uuid: CASH_UUID, pricelist_name: "Cash" }]}
        onAdded={vi.fn()}
      />,
    );

    expect(screen.getByTestId("product-pricelist-add-button")).toBeInTheDocument();
    expect(screen.getByTestId("product-pricelist-actions-menu-button")).toBeEnabled();
    await waitFor(() => {
      expect(screen.getByTestId("product-pricelist-actions")).toHaveAttribute(
        "data-remaining-count",
        "1",
      );
      expect(screen.getByTestId("product-pricelist-actions")).toHaveAttribute(
        "data-add-to-all-disabled",
        "false",
      );
    });
  });

  it("disables add to all when the product is already on every active pricelist", async () => {
    render(
      <ProductPricelistActions
        product={PRODUCT}
        existingItems={[
          { pricelist_uuid: CASH_UUID, pricelist_name: "Cash" },
          { pricelist_uuid: INSURANCE_UUID, pricelist_name: "Insurance" },
        ]}
        onAdded={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId("product-pricelist-actions")).toHaveAttribute(
        "data-remaining-count",
        "0",
      );
      expect(screen.getByTestId("product-pricelist-actions")).toHaveAttribute(
        "data-add-to-all-disabled",
        "true",
      );
      expect(screen.getByTestId("product-pricelist-actions")).toHaveAttribute(
        "data-add-to-all-disabled-reason",
        "Already on every active pricelist",
      );
    });
  });

  it("disables add to all when no active pricelists exist", async () => {
    fetchOrganizationPricelistsMock.mockResolvedValue({
      results: [
        {
          uuid: ARCHIVED_UUID,
          name: "Archived",
          is_active: false,
          currency_code: "MWK",
        },
      ],
      pagination: { count: 1, next: null, previous: null },
    });

    render(
      <ProductPricelistActions
        product={PRODUCT}
        existingItems={[]}
        onAdded={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId("product-pricelist-actions")).toHaveAttribute(
        "data-remaining-count",
        "0",
      );
      expect(screen.getByTestId("product-pricelist-actions")).toHaveAttribute(
        "data-add-to-all-disabled",
        "true",
      );
      expect(screen.getByTestId("product-pricelist-actions")).toHaveAttribute(
        "data-add-to-all-disabled-reason",
        "No active pricelists",
      );
    });
  });
});
