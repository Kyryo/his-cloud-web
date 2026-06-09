import { beforeEach, describe, expect, it, vi } from "vitest";

import { BFF_SALES_ORDERS_ROUTES } from "@/constants/api";
import {
  fetchSalesOrder,
  fetchSalesOrders,
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
});
