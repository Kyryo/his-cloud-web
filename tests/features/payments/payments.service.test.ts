import { beforeEach, describe, expect, it, vi } from "vitest";

import { BFF_PAYMENTS_ROUTES } from "@/constants/api";
import {
  fetchPaymentSummaryStats,
  fetchPayments,
} from "@/features/payments/services/payments.service";
import { bffRequest } from "@/lib/bff-client";

vi.mock("@/lib/bff-client", () => ({
  bffRequest: vi.fn(),
}));

describe("payments.service summary stats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches payments with pagination", async () => {
    vi.mocked(bffRequest).mockResolvedValue({
      results: [],
      pagination: { count: 0, next: null, previous: null },
    });

    await fetchPayments({ page: 1, pageSize: 20, search: "PAY-1", state: "posted" });

    expect(bffRequest).toHaveBeenCalledWith(
      `${BFF_PAYMENTS_ROUTES.list}?page=1&page_size=20&search=PAY-1&state=posted`,
    );
  });

  it("fetches summary stats with search and filters but no page", async () => {
    vi.mocked(bffRequest).mockResolvedValue({
      all: { count: 1, total: "60.00" },
      posted: { count: 1, total: "60.00" },
      draft: { count: 0, total: "0.00" },
      cancelled: { count: 0, total: "0.00" },
    });

    await fetchPaymentSummaryStats({
      page: 2,
      pageSize: 20,
      search: "PAY-POSTED",
      state: "posted",
    });

    expect(bffRequest).toHaveBeenCalledWith(
      `${BFF_PAYMENTS_ROUTES.summaryStats}?search=PAY-POSTED&state=posted`,
    );
  });
});
