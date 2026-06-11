import { beforeEach, describe, expect, it, vi } from "vitest";

import { BFF_INVENTORY_ROUTES } from "@/constants/api";
import {
  fetchInventoryStock,
  searchInventoryProducts,
} from "@/features/inventory/services/inventory.service";
import {
  fetchPurchaseOrders,
  runPurchaseOrderAction,
} from "@/features/inventory/services/purchase-orders.service";
import { bffRequest } from "@/lib/bff-client";

vi.mock("@/lib/bff-client", () => ({
  bffRequest: vi.fn(),
}));

describe("inventory.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches stock with query params via the BFF", async () => {
    vi.mocked(bffRequest).mockResolvedValue({
      results: [],
      pagination: { count: 0, next: null, previous: null },
    });

    await fetchInventoryStock({
      page: 1,
      pageSize: 20,
      location: 3,
      odoo_product_id: 42,
    });

    expect(bffRequest).toHaveBeenCalledWith(
      `${BFF_INVENTORY_ROUTES.stock.list}?page=1&page_size=20&location=3&odoo_product_id=42`,
    );
  });

  it("searches products via the BFF", async () => {
    vi.mocked(bffRequest).mockResolvedValue([]);

    await searchInventoryProducts({ q: "paracetamol", active: true });

    expect(bffRequest).toHaveBeenCalledWith(
      `${BFF_INVENTORY_ROUTES.products.search}?q=paracetamol&active=true`,
    );
  });
});

describe("purchase-orders.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches purchase orders with status filter", async () => {
    vi.mocked(bffRequest).mockResolvedValue({
      results: [],
      pagination: { count: 0, next: null, previous: null },
    });

    await fetchPurchaseOrders({ status: "DRAFT", page: 1, pageSize: 20 });

    expect(bffRequest).toHaveBeenCalledWith(
      `${BFF_INVENTORY_ROUTES.purchaseOrders.list}?page=1&page_size=20&status=DRAFT`,
    );
  });

  it("runs purchase order actions via the BFF", async () => {
    vi.mocked(bffRequest).mockResolvedValue({ uuid: "po-1", status: "SUBMITTED" });

    await runPurchaseOrderAction("po-1", "submit");

    expect(bffRequest).toHaveBeenCalledWith(
      BFF_INVENTORY_ROUTES.purchaseOrders.action("po-1", "submit"),
      { method: "POST" },
    );
  });
});
