import { beforeEach, describe, expect, it, vi } from "vitest";

import { BFF_RECEIVABLES_ROUTES } from "@/constants/api";
import {
  fetchReceivablesDebtors,
  fetchReceivablesInvoices,
  fetchReceivablesSummaryStats,
} from "@/features/receivables/services/receivables.service";
import { bffRequest } from "@/lib/bff-client";

vi.mock("@/lib/bff-client", () => ({
  bffRequest: vi.fn(),
}));

describe("receivables.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches debtors with pagination and search", async () => {
    vi.mocked(bffRequest).mockResolvedValue({
      results: [],
      pagination: { count: 0, next: null, previous: null },
    });

    await fetchReceivablesDebtors({ page: 2, pageSize: 25, search: "Ada" });

    expect(bffRequest).toHaveBeenCalledWith(
      `${BFF_RECEIVABLES_ROUTES.debtors}?page=2&page_size=25&search=Ada`,
    );
  });

  it("fetches invoices with an aging bucket", async () => {
    vi.mocked(bffRequest).mockResolvedValue({
      results: [],
      pagination: { count: 0, next: null, previous: null },
    });

    await fetchReceivablesInvoices({ agingBucket: "31-60" });

    expect(bffRequest).toHaveBeenCalledWith(
      `${BFF_RECEIVABLES_ROUTES.invoices}?aging_bucket=31-60`,
    );
  });

  it("fetches summary stats", async () => {
    vi.mocked(bffRequest).mockResolvedValue({
      debtors_count: 213,
      total_receivable: "111285739.00",
      open_invoice_count: 183,
      aging: {
        "0-30": { count: 70, total: "5885830.00" },
        "31-60": { count: 113, total: "17681290.00" },
        "61-90": { count: 0, total: "0.00" },
        "90+": { count: 0, total: "0.00" },
      },
    });

    await fetchReceivablesSummaryStats();

    expect(bffRequest).toHaveBeenCalledWith(BFF_RECEIVABLES_ROUTES.summaryStats);
  });
});
