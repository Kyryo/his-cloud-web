import { describe, expect, it, vi } from "vitest";

import { BFF_CUSTOMER_ADDRESSES_ROUTES } from "@/constants/api";
import { updateCustomerAddress } from "@/features/customers/services/customer-addresses.service";
import {
  extractCustomerBillingCounts,
  fetchCustomerBillingSummary,
} from "@/features/customers/services/customer-billing.service";
import { bffRequest } from "@/lib/bff-client";

vi.mock("@/lib/bff-client", () => ({
  bffRequest: vi.fn(),
}));

describe("customer detail services", () => {
  it("fetches billing summary with lightweight pagination query", async () => {
    vi.mocked(bffRequest).mockResolvedValueOnce({
      sales_orders: [],
      invoices: [],
      payments: [],
      sales_orders_pagination: { count: 0, limit: 1, offset: 0, has_next: false },
      invoices_pagination: { count: 0, limit: 1, offset: 0, has_next: false },
      payments_pagination: { count: 0, limit: 1, offset: 0, has_next: false },
      sales_orders_stats: {},
      invoices_stats: {},
      totals: { total_due: "0" },
    });

    await fetchCustomerBillingSummary("customer-uuid");

    expect(bffRequest).toHaveBeenCalledWith(
      "/api/customers/customer-uuid/billing?sales_limit=1&sales_offset=0&invoice_limit=1&invoice_offset=0&payment_limit=1&payment_offset=0",
    );
  });

  it("extracts billing counts from summary payload", () => {
    expect(
      extractCustomerBillingCounts({
        // only fields used by the helper
        sales_orders_pagination: { count: 2 },
        invoices_pagination: { count: 3 },
        payments_pagination: { count: 4 },
      } as any),
    ).toEqual({ salesOrders: 2, invoices: 3, payments: 4 });
  });

  it("updates customer address via the BFF", async () => {
    vi.mocked(bffRequest).mockResolvedValue({ uuid: "address-1" });

    await updateCustomerAddress("address-uuid", {
      address_type: "HOME",
      line1: "Updated line",
    } as any);

    expect(bffRequest).toHaveBeenCalledWith(
      BFF_CUSTOMER_ADDRESSES_ROUTES.detail("address-uuid"),
      {
        method: "PATCH",
        body: { address_type: "HOME", line1: "Updated line" },
      },
    );
  });
});

