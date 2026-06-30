import { beforeEach, describe, expect, it, vi } from "vitest";

import { BFF_SALES_ORDERS_ROUTES } from "@/constants/api";
import {
  addSalesOrderLine,
  cancelSalesOrder,
  createSalesOrderInvoice,
  fetchSalesOrder,
  fetchSalesOrders,
  removeSalesOrderLine,
  updateSalesOrderLinePrice,
} from "@/features/sales-orders/services/sales-orders.service";
import { bffRequest } from "@/lib/bff-client";

vi.mock("@/lib/bff-client", () => ({
  bffRequest: vi.fn(),
}));

describe("sales-orders.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches sales orders with query params via the BFF", async () => {
    vi.mocked(bffRequest).mockResolvedValue({
      results: [],
      pagination: { count: 0, next: null, previous: null },
    });

    await fetchSalesOrders({
      page: 2,
      pageSize: 20,
      name: "S00081",
      state: "sale",
      invoiceStatus: "to invoice",
      dateFrom: "2024-01-01",
      dateTo: "2024-12-31",
    });

    expect(bffRequest).toHaveBeenCalledWith(
      `${BFF_SALES_ORDERS_ROUTES.list}?page=2&page_size=20&name=S00081&state=sale&invoice_status=to+invoice&date_from=2024-01-01&date_to=2024-12-31`,
    );
  });

  it("fetches a sales order detail via the BFF", async () => {
    vi.mocked(bffRequest).mockResolvedValue({ id: 81, name: "S00081" });

    await fetchSalesOrder(81);

    expect(bffRequest).toHaveBeenCalledWith(BFF_SALES_ORDERS_ROUTES.detail(81));
  });

  it("adds sales order lines via the BFF", async () => {
    vi.mocked(bffRequest).mockResolvedValue({ id: 81, name: "S00081" });

    await addSalesOrderLine(81, {
      product_id: 12,
      quantity: "2.0000",
      price_unit: "10.0000",
    });

    expect(bffRequest).toHaveBeenCalledWith(BFF_SALES_ORDERS_ROUTES.lines(81), {
      method: "POST",
      body: {
        product_id: 12,
        quantity: "2.0000",
        price_unit: "10.0000",
      },
    });
  });

  it("updates sales order line prices via the BFF", async () => {
    vi.mocked(bffRequest).mockResolvedValue({ id: 81, name: "S00081" });

    await updateSalesOrderLinePrice(81, 3, { price_unit: "18.0000" });

    expect(bffRequest).toHaveBeenCalledWith(
      BFF_SALES_ORDERS_ROUTES.linePrice(81, 3),
      {
        method: "PATCH",
        body: { price_unit: "18.0000" },
      },
    );
  });

  it("removes sales order lines via the BFF", async () => {
    vi.mocked(bffRequest).mockResolvedValue({ id: 81, name: "S00081" });

    await removeSalesOrderLine(81, 3);

    expect(bffRequest).toHaveBeenCalledWith(
      BFF_SALES_ORDERS_ROUTES.lineDetail(81, 3),
      { method: "DELETE" },
    );
  });

  it("creates a sales order invoice via the BFF", async () => {
    vi.mocked(bffRequest).mockResolvedValue({
      sales_order: 81,
      invoice: { id: 501, name: "INV/2026/0001" },
    });

    await createSalesOrderInvoice(81);

    expect(bffRequest).toHaveBeenCalledWith(BFF_SALES_ORDERS_ROUTES.invoice(81), {
      method: "POST",
    });
  });

  it("cancels a sales order via the BFF", async () => {
    vi.mocked(bffRequest).mockResolvedValue({ id: 81, name: "S00081", state: "cancel" });

    await cancelSalesOrder(81);

    expect(bffRequest).toHaveBeenCalledWith(BFF_SALES_ORDERS_ROUTES.cancel(81), {
      method: "POST",
    });
  });
});
