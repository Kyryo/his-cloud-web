import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  BFF_CUSTOMER_ADDRESSES_ROUTES,
  BFF_CUSTOMER_ENCOUNTERS_ROUTES,
  BFF_CUSTOMER_NOTES_ROUTES,
  BFF_CUSTOMERS_ROUTES,
} from "@/constants/api";
import {
  extractCustomerBillingCounts,
  fetchCustomerBillingSummary,
} from "@/features/customers/services/customer-billing.service";
import { fetchCustomerEncounters } from "@/features/customers/services/customer-encounters.service";
import { fetchCustomerAddresses } from "@/features/customers/services/customer-addresses.service";
import { updateCustomerAddress } from "@/features/customers/services/customer-addresses.service";
import { fetchCustomerInsurance } from "@/features/customers/services/customer-insurance.service";
import { updateCustomerInsurance } from "@/features/customers/services/customer-insurance.service";
import { fetchCustomerNotes } from "@/features/customers/services/customer-notes.service";
import { updateCustomerNote } from "@/features/customers/services/customer-notes.service";
import {
  countCustomerVisits,
  fetchCustomerVisits,
} from "@/features/customers/services/customer-visits.service";
import { bffRequest } from "@/lib/bff-client";

vi.mock("@/lib/bff-client", () => ({
  bffRequest: vi.fn(),
}));

describe("customer detail services", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches billing summary with lightweight pagination query", async () => {
    vi.mocked(bffRequest).mockResolvedValue({
      sales_orders_pagination: { count: 2 },
      invoices_pagination: { count: 3 },
      payments_pagination: { count: 4 },
    });

    await fetchCustomerBillingSummary("customer-uuid");

    expect(bffRequest).toHaveBeenCalledWith(
      `${BFF_CUSTOMERS_ROUTES.billing("customer-uuid")}?sales_limit=1&sales_offset=0&invoice_limit=1&invoice_offset=0&payment_limit=1&payment_offset=0`,
    );
  });

  it("extracts billing counts from summary payload", () => {
    expect(
      extractCustomerBillingCounts({
        sales_orders_pagination: {
          count: 2,
          limit: 1,
          offset: 0,
          has_next: true,
          has_previous: false,
        },
        invoices_pagination: {
          count: 3,
          limit: 1,
          offset: 0,
          has_next: true,
          has_previous: false,
        },
        payments_pagination: {
          count: 4,
          limit: 1,
          offset: 0,
          has_next: true,
          has_previous: false,
        },
        totals: {
          total_sales: 0,
          total_invoiced: 0,
          total_paid: 0,
          total_due: 0,
        },
      }),
    ).toEqual({
      salesOrders: 2,
      invoices: 3,
      payments: 4,
    });
  });

  it("fetches customer visits and counts them", async () => {
    vi.mocked(bffRequest).mockResolvedValue([{ uuid: "visit-1" }, { uuid: "visit-2" }]);

    const visits = await fetchCustomerVisits("customer-uuid");

    expect(bffRequest).toHaveBeenCalledWith(
      BFF_CUSTOMERS_ROUTES.visits("customer-uuid"),
    );
    expect(countCustomerVisits(visits)).toBe(2);
  });

  it("fetches paginated customer encounters", async () => {
    vi.mocked(bffRequest).mockResolvedValue({
      results: [{ uuid: "encounter-1" }],
      pagination: { count: 1, next: null, previous: null },
    });

    await fetchCustomerEncounters({
      customerId: 42,
      page: 2,
      pageSize: 10,
    });

    expect(bffRequest).toHaveBeenCalledWith(
      `${BFF_CUSTOMER_ENCOUNTERS_ROUTES.list}?customer=42&page=2&page_size=10&ordering=-occurred_at`,
    );
  });

  it("fetches customer insurance list", async () => {
    vi.mocked(bffRequest).mockResolvedValue([{ uuid: "insurance-1" }]);

    await fetchCustomerInsurance("customer-uuid");

    expect(bffRequest).toHaveBeenCalledWith(
      BFF_CUSTOMERS_ROUTES.insurance("customer-uuid"),
    );
  });

  it("fetches paginated customer addresses", async () => {
    vi.mocked(bffRequest).mockResolvedValue({
      results: [{ uuid: "address-1" }],
      pagination: null,
    });

    await fetchCustomerAddresses({ customerId: 7, page: 1, pageSize: 10 });

    expect(bffRequest).toHaveBeenCalledWith(
      `${BFF_CUSTOMER_ADDRESSES_ROUTES.list}?customer=7&page=1&page_size=10&ordering=-is_primary%2C-created_at`,
    );
  });

  it("fetches paginated customer notes", async () => {
    vi.mocked(bffRequest).mockResolvedValue({
      results: [{ uuid: "note-1" }],
      pagination: null,
    });

    await fetchCustomerNotes({ customerId: 7, page: 1, pageSize: 10 });

    expect(bffRequest).toHaveBeenCalledWith(
      `${BFF_CUSTOMER_NOTES_ROUTES.list}?customer=7&page=1&page_size=10`,
    );
  });

  it("updates customer address via the BFF", async () => {
    vi.mocked(bffRequest).mockResolvedValue({ uuid: "address-1" });

    await updateCustomerAddress("address-uuid", { line1: "Updated line" });

    expect(bffRequest).toHaveBeenCalledWith(
      BFF_CUSTOMER_ADDRESSES_ROUTES.detail("address-uuid"),
      {
        method: "PATCH",
        body: { line1: "Updated line" },
      },
    );
  });

  it("updates customer note via the BFF", async () => {
    vi.mocked(bffRequest).mockResolvedValue({ uuid: "note-1" });

    await updateCustomerNote("note-uuid", { body: "Updated note" });

    expect(bffRequest).toHaveBeenCalledWith(
      BFF_CUSTOMER_NOTES_ROUTES.detail("note-uuid"),
      {
        method: "PATCH",
        body: { body: "Updated note" },
      },
    );
  });

  it("updates customer insurance via the BFF", async () => {
    vi.mocked(bffRequest).mockResolvedValue({ uuid: "insurance-1" });

    await updateCustomerInsurance("customer-uuid", "insurance-uuid", {
      membership_number: "MEM999",
    });

    expect(bffRequest).toHaveBeenCalledWith(
      BFF_CUSTOMERS_ROUTES.insuranceDetail("customer-uuid", "insurance-uuid"),
      {
        method: "PATCH",
        body: { membership_number: "MEM999" },
      },
    );
  });
});
