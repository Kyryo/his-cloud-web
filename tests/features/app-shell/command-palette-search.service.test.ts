import { beforeEach, describe, expect, it, vi } from "vitest";

import { searchCommandPaletteRecords } from "@/features/app-shell/services/command-palette-search.service";
import { ROUTES } from "@/constants/routes";
import { fetchCustomers } from "@/features/customers/services/customers.service";
import { fetchInvoices } from "@/features/invoices/services/invoices.service";
import { fetchSalesOrders } from "@/features/sales-orders/services/sales-orders.service";

vi.mock("@/features/customers/services/customers.service", () => ({
  fetchCustomers: vi.fn(),
}));

vi.mock("@/features/sales-orders/services/sales-orders.service", () => ({
  fetchSalesOrders: vi.fn(),
}));

vi.mock("@/features/invoices/services/invoices.service", () => ({
  fetchInvoices: vi.fn(),
}));

const fetchCustomersMock = vi.mocked(fetchCustomers);
const fetchSalesOrdersMock = vi.mocked(fetchSalesOrders);
const fetchInvoicesMock = vi.mocked(fetchInvoices);

describe("searchCommandPaletteRecords", () => {
  beforeEach(() => {
    fetchCustomersMock.mockReset();
    fetchSalesOrdersMock.mockReset();
    fetchInvoicesMock.mockReset();
  });

  it("searches permitted record types in parallel and keeps a failed type from hiding the rest", async () => {
    fetchCustomersMock.mockResolvedValue({
      results: [
        {
          uuid: "cust-1",
          first_name: "Ada",
          middle_name: null,
          last_name: "Lovelace",
          full_name: "Ada Lovelace",
          customer_identifier: "CL-001",
        } as never,
      ],
      pagination: null,
    });
    fetchSalesOrdersMock.mockRejectedValue(new Error("forbidden"));
    fetchInvoicesMock.mockResolvedValue({
      results: [
        {
          uuid: "inv-1",
          name: "INV/2026/0001",
          customer_name: "Ada Lovelace",
        } as never,
      ],
      pagination: null,
    });

    const items = await searchCommandPaletteRecords({
      query: "Ada",
      canSearchClients: true,
      canSearchBilling: true,
    });

    expect(fetchCustomersMock).toHaveBeenCalledWith({
      search: "Ada",
      pageSize: 5,
    });
    expect(fetchSalesOrdersMock).toHaveBeenCalledWith({
      search: "Ada",
      pageSize: 5,
    });
    expect(fetchInvoicesMock).toHaveBeenCalledWith({
      search: "Ada",
      pageSize: 5,
    });
    expect(items.map((item) => item.href)).toEqual([
      ROUTES.customerDetail("cust-1"),
      ROUTES.invoiceDetail("inv-1"),
    ]);
  });

  it("skips billing search when the user cannot access it", async () => {
    fetchCustomersMock.mockResolvedValue({ results: [], pagination: null });

    await searchCommandPaletteRecords({
      query: "Ada",
      canSearchClients: true,
      canSearchBilling: false,
    });

    expect(fetchCustomersMock).toHaveBeenCalled();
    expect(fetchSalesOrdersMock).not.toHaveBeenCalled();
    expect(fetchInvoicesMock).not.toHaveBeenCalled();
  });
});
