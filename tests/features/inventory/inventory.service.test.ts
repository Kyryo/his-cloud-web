import { beforeEach, describe, expect, it, vi } from "vitest";

import { BFF_INVENTORY_ROUTES } from "@/constants/api";
import {
  createInventoryProduct,
  fetchInventoryProductPricelists,
  fetchInventoryProductStockLocations,
  fetchInventoryStock,
  searchInventoryProducts,
  updateInventoryProduct,
} from "@/features/inventory/services/inventory.service";
import {
  createPurchaseOrder,
  fetchPurchaseOrders,
  runPurchaseOrderAction,
  updatePurchaseOrder,
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

  it("creates products via the BFF", async () => {
    vi.mocked(bffRequest).mockResolvedValue({
      id: 101,
      name: "Ibuprofen",
      display_name: "Ibuprofen",
      active: true,
    });

    await createInventoryProduct({
      name: "Ibuprofen",
      default_code: "IBU",
      product_type: "product",
    });

    expect(bffRequest).toHaveBeenCalledWith(BFF_INVENTORY_ROUTES.products.list, {
      method: "POST",
      body: {
        name: "Ibuprofen",
        default_code: "IBU",
        product_type: "product",
      },
    });
  });

  it("fetches product pricelists via the BFF", async () => {
    vi.mocked(bffRequest).mockResolvedValue([]);

    await fetchInventoryProductPricelists(101);

    expect(bffRequest).toHaveBeenCalledWith(
      BFF_INVENTORY_ROUTES.products.pricelists(101),
    );
  });

  it("fetches product stock locations via the BFF", async () => {
    vi.mocked(bffRequest).mockResolvedValue([]);

    await fetchInventoryProductStockLocations(101);

    expect(bffRequest).toHaveBeenCalledWith(
      BFF_INVENTORY_ROUTES.products.stockLocations(101),
    );
  });

  it("updates products via the BFF", async () => {
    vi.mocked(bffRequest).mockResolvedValue({
      id: 101,
      name: "Ibuprofen",
      display_name: "Ibuprofen",
      active: true,
    });

    await updateInventoryProduct(101, {
      name: "Ibuprofen",
      product_type: "product",
      is_drug: true,
      liquid_or_cream: false,
      is_procedure: false,
      dental_only_procedure: false,
      opd_only_procedure: false,
      ipd_only_procedure: false,
      physio_only_procedure: false,
      clinic_wide_procedure: false,
      sale_ok: true,
      purchase_ok: true,
      active: true,
    });

    expect(bffRequest).toHaveBeenCalledWith(
      BFF_INVENTORY_ROUTES.products.detail(101),
      {
        method: "PATCH",
        body: expect.objectContaining({ name: "Ibuprofen" }),
      },
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

  it("creates purchase orders without line items", async () => {
    vi.mocked(bffRequest).mockResolvedValue({ uuid: "po-2", lines: [] });

    await createPurchaseOrder({
      vendor_name: "Acme Supplies",
      receiving_location: 4,
      lines: [],
    });

    expect(bffRequest).toHaveBeenCalledWith(
      BFF_INVENTORY_ROUTES.purchaseOrders.list,
      {
        method: "POST",
        body: {
          vendor_name: "Acme Supplies",
          receiving_location: 4,
          lines: [],
        },
      },
    );
  });

  it("updates purchase order line items via PATCH", async () => {
    vi.mocked(bffRequest).mockResolvedValue({ uuid: "po-2", lines: [{ id: 1 }] });

    await updatePurchaseOrder("po-2", {
      lines: [{ odoo_product_id: 9, quantity: "1", unit_cost: "10" }],
    });

    expect(bffRequest).toHaveBeenCalledWith(
      BFF_INVENTORY_ROUTES.purchaseOrders.detail("po-2"),
      {
        method: "PATCH",
        body: {
          lines: [{ odoo_product_id: 9, quantity: "1", unit_cost: "10" }],
        },
      },
    );
  });
});
