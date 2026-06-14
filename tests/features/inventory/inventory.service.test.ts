import { beforeEach, describe, expect, it, vi } from "vitest";

import { BFF_INVENTORY_ROUTES, BFF_SETTINGS_ROUTES } from "@/constants/api";
import {
  addProductToPricelist,
  createInventoryProduct,
  createProductTariffCode,
  deleteProductTariffCode,
  fetchInventoryProductPricelists,
  fetchInventoryStock,
  fetchProductTariffCodes,
  removeProductFromPricelist,
  searchInventoryProducts,
  updateInventoryProduct,
  updatePricelistProductPrice,
  updateProductTariffCode,
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

  it("fetches product tariff codes via the BFF", async () => {
    vi.mocked(bffRequest).mockResolvedValue([]);

    await fetchProductTariffCodes(101);

    expect(bffRequest).toHaveBeenCalledWith(
      BFF_INVENTORY_ROUTES.products.tariffCodes(101),
    );
  });

  it("creates product tariff codes via the BFF", async () => {
    vi.mocked(bffRequest).mockResolvedValue({
      scheme_uuid: "scheme-1",
      tariff_code: "03001",
    });

    await createProductTariffCode(101, {
      scheme: "scheme-1",
      tariff_code: "03001",
    });

    expect(bffRequest).toHaveBeenCalledWith(
      BFF_INVENTORY_ROUTES.products.tariffCodes(101),
      {
        method: "POST",
        body: { scheme: "scheme-1", tariff_code: "03001" },
      },
    );
  });

  it("updates product tariff codes via the BFF", async () => {
    vi.mocked(bffRequest).mockResolvedValue({
      scheme_uuid: "scheme-1",
      tariff_code: "03002",
    });

    await updateProductTariffCode(101, "scheme-1", { tariff_code: "03002" });

    expect(bffRequest).toHaveBeenCalledWith(
      BFF_INVENTORY_ROUTES.products.tariffCodeDetail(101, "scheme-1"),
      {
        method: "PATCH",
        body: { tariff_code: "03002" },
      },
    );
  });

  it("deletes product tariff codes via the BFF", async () => {
    vi.mocked(bffRequest).mockResolvedValue(undefined);

    await deleteProductTariffCode(101, "scheme-1");

    expect(bffRequest).toHaveBeenCalledWith(
      BFF_INVENTORY_ROUTES.products.tariffCodeDetail(101, "scheme-1"),
      { method: "DELETE" },
    );
  });

  it("adds products to pricelists via the BFF", async () => {
    vi.mocked(bffRequest).mockResolvedValue({ approval_required: false });

    await addProductToPricelist(5, {
      product_id: 101,
      fixed_price: "12.50",
    });

    expect(bffRequest).toHaveBeenCalledWith(
      BFF_SETTINGS_ROUTES.pricelistAddProduct(5),
      {
        method: "POST",
        body: { product_id: 101, fixed_price: "12.50" },
      },
    );
  });

  it("updates pricelist product prices via the BFF", async () => {
    vi.mocked(bffRequest).mockResolvedValue({ approval_required: false });

    await updatePricelistProductPrice(5, 9, { fixed_price: "15.00" });

    expect(bffRequest).toHaveBeenCalledWith(
      BFF_SETTINGS_ROUTES.pricelistUpdateProductPrice(5, 9),
      {
        method: "PATCH",
        body: { fixed_price: "15.00" },
      },
    );
  });

  it("removes products from pricelists via the BFF", async () => {
    vi.mocked(bffRequest).mockResolvedValue({ approval_required: false });

    await removeProductFromPricelist(5, 9);

    expect(bffRequest).toHaveBeenCalledWith(
      BFF_SETTINGS_ROUTES.pricelistRemoveProduct(5, 9),
      { method: "DELETE" },
    );
  });

  it("fetches product stock locations via the BFF", async () => {
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
