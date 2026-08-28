import { beforeEach, describe, expect, it, vi } from "vitest";

import { BFF_INVOICES_ROUTES } from "@/constants/api";
import {
  fetchInvoiceSummaryStats,
  fetchInvoices,
} from "@/features/invoices/services/invoices.service";
import { bffRequest } from "@/lib/bff-client";

vi.mock("@/lib/bff-client", () => ({
  bffRequest: vi.fn(),
}));

describe("invoices.service summary stats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches invoices with pagination", async () => {
    vi.mocked(bffRequest).mockResolvedValue({
      results: [],
      pagination: { count: 0, next: null, previous: null },
    });

    await fetchInvoices({ page: 2, pageSize: 20, search: "INV-1", state: "posted" });

    expect(bffRequest).toHaveBeenCalledWith(
      `${BFF_INVOICES_ROUTES.list}?page=2&page_size=20&search=INV-1&state=posted`,
    );
  });

  it("fetches summary stats with search and filters but no page", async () => {
    vi.mocked(bffRequest).mockResolvedValue({
      all: { count: 1, total: "80.00" },
      paid: { count: 0, total: "0.00" },
      not_paid: { count: 1, total: "80.00" },
      partially_paid: { count: 0, total: "0.00" },
    });

    await fetchInvoiceSummaryStats({
      page: 3,
      pageSize: 20,
      search: "INV-UNPAID",
      state: "posted",
      paymentStatus: "not_paid",
    });

    expect(bffRequest).toHaveBeenCalledWith(
      `${BFF_INVOICES_ROUTES.summaryStats}?search=INV-UNPAID&state=posted&payment_status=not_paid`,
    );
  });
});
