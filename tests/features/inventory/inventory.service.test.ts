import { beforeEach, describe, expect, it, vi } from "vitest";

import { BFF_INVENTORY_ROUTES } from "@/constants/api";
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

const PRODUCT_UUID = "11111111-1111-1111-1111-111111111111";
const PRICELIST_UUID = "22222222-2222-2222-2222-222222222222";

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
      product_id: 42,
    });

    expect(bffRequest).toHaveBeenCalledWith(
      `${BFF_INVENTORY_ROUTES.stock.list}?page=1&page_size=20&location=3&product_id=42`,
    );
  });

  it("searches products via the catalog BFF", async () => {
    vi.mocked(bffRequest).mockResolvedValue({
      results: [],
      pagination: { count: 0, next: null, previous: null },
    });

    await searchInventoryProducts({ q: "paracetamol", active: true });

    expect(bffRequest).toHaveBeenCalledWith(
      `${BFF_INVENTORY_ROUTES.products.list}?page_size=200&q=paracetamol&active=true`,
    );
  });

  it("creates products via the catalog BFF", async () => {
    vi.mocked(bffRequest).mockResolvedValue({
      uuid: PRODUCT_UUID,
      name: "Ibuprofen",
      display_name: "Ibuprofen",
      active: true,
    });

    await createInventoryProduct({
      name: "Ibuprofen",
      default_code: "IBU",
      product_type: "product",
    });

    expect(bffRequest).toHaveBeenCalledWith(
      BFF_INVENTORY_ROUTES.products.list,
      expect.objectContaining({
        method: "POST",
        body: expect.objectContaining({
          name: "Ibuprofen",
          default_code: "IBU",
          product_type: "product",
        }),
      }),
    );
  });

  it("fetches product pricelists via the BFF", async () => {
    vi.mocked(bffRequest).mockResolvedValue({
      results: [],
      pagination: { count: 0, next: null, previous: null },
    });

    await fetchInventoryProductPricelists(PRODUCT_UUID);

    expect(bffRequest).toHaveBeenCalledWith(
      `${BFF_INVENTORY_ROUTES.products.pricelists(PRODUCT_UUID)}?page_size=200`,
    );
  });

  it("fetches product tariff codes via the BFF", async () => {
    vi.mocked(bffRequest).mockResolvedValue([]);

    await fetchProductTariffCodes(PRODUCT_UUID);

    expect(bffRequest).toHaveBeenCalledWith(
      BFF_INVENTORY_ROUTES.products.tariffCodes(PRODUCT_UUID),
    );
  });

  it("creates product tariff codes via the BFF", async () => {
    vi.mocked(bffRequest).mockResolvedValue({
      scheme_uuid: "scheme-1",
      tariff_code: "03001",
    });

    await createProductTariffCode(PRODUCT_UUID, {
      scheme_uuid: "scheme-1",
      tariff_code: "03001",
    });

    expect(bffRequest).toHaveBeenCalledWith(
      BFF_INVENTORY_ROUTES.products.tariffCodes(PRODUCT_UUID),
      {
        method: "POST",
        body: { scheme_uuid: "scheme-1", tariff_code: "03001" },
      },
    );
  });

  it("updates product tariff codes via the BFF", async () => {
    vi.mocked(bffRequest).mockResolvedValue({
      scheme_uuid: "scheme-1",
      tariff_code: "03002",
    });

    await updateProductTariffCode(PRODUCT_UUID, "scheme-1", {
      tariff_code: "03002",
    });

    expect(bffRequest).toHaveBeenCalledWith(
      BFF_INVENTORY_ROUTES.products.tariffCodeDetail(PRODUCT_UUID, "scheme-1"),
      {
        method: "PATCH",
        body: { tariff_code: "03002" },
      },
    );
  });

  it("deletes product tariff codes via the BFF", async () => {
    vi.mocked(bffRequest).mockResolvedValue(undefined);

    await deleteProductTariffCode(PRODUCT_UUID, "scheme-1");

    expect(bffRequest).toHaveBeenCalledWith(
      BFF_INVENTORY_ROUTES.products.tariffCodeDetail(PRODUCT_UUID, "scheme-1"),
      { method: "DELETE" },
    );
  });

  it("adds products to pricelists via the BFF", async () => {
    vi.mocked(bffRequest).mockResolvedValue({ approval_required: false });

    await addProductToPricelist(PRICELIST_UUID, {
      product_uuid: PRODUCT_UUID,
      fixed_price: "12.50",
    });

    expect(bffRequest).toHaveBeenCalledWith(
      BFF_INVENTORY_ROUTES.pricelists.products(PRICELIST_UUID),
      {
        method: "POST",
        body: { product_uuid: PRODUCT_UUID, fixed_price: "12.50" },
      },
    );
  });

  it("updates pricelist product prices via the BFF", async () => {
    vi.mocked(bffRequest).mockResolvedValue({ approval_required: false });

    await updatePricelistProductPrice(PRICELIST_UUID, PRODUCT_UUID, {
      fixed_price: "15.00",
    });

    expect(bffRequest).toHaveBeenCalledWith(
      BFF_INVENTORY_ROUTES.pricelists.productDetail(PRICELIST_UUID, PRODUCT_UUID),
      {
        method: "PATCH",
        body: { fixed_price: "15.00" },
      },
    );
  });

  it("removes products from pricelists via the BFF", async () => {
    vi.mocked(bffRequest).mockResolvedValue({ approval_required: false });

    await removeProductFromPricelist(PRICELIST_UUID, PRODUCT_UUID);

    expect(bffRequest).toHaveBeenCalledWith(
      BFF_INVENTORY_ROUTES.pricelists.productDetail(PRICELIST_UUID, PRODUCT_UUID),
      { method: "DELETE" },
    );
  });

  it("updates products via the catalog BFF", async () => {
    vi.mocked(bffRequest).mockResolvedValue({
      uuid: PRODUCT_UUID,
      name: "Ibuprofen",
      display_name: "Ibuprofen",
      active: true,
    });

    await updateInventoryProduct(PRODUCT_UUID, {
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
      BFF_INVENTORY_ROUTES.products.detail(PRODUCT_UUID),
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
      lines: [{ product_id: 9, quantity: "1", unit_cost: "10" }],
    });

    expect(bffRequest).toHaveBeenCalledWith(
      BFF_INVENTORY_ROUTES.purchaseOrders.detail("po-2"),
      {
        method: "PATCH",
        body: {
          lines: [{ product_id: 9, quantity: "1", unit_cost: "10" }],
        },
      },
    );
  });
});
