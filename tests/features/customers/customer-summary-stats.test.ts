import { beforeEach, describe, expect, it, vi } from "vitest";

import { fetchCustomerSummaryStats } from "@/features/customers/utils/customer-stats";
import { bffRequest } from "@/lib/bff-client";

vi.mock("@/lib/bff-client", () => ({
  bffRequest: vi.fn(),
}));

describe("fetchCustomerSummaryStats", () => {
  beforeEach(() => {
    vi.mocked(bffRequest).mockReset();
  });

  it("maps the dedicated summary-stats endpoint into card values", async () => {
    vi.mocked(bffRequest).mockResolvedValueOnce({
      total_clients: 10,
      new_this_month: 2,
      male_count: 4,
      female_count: 5,
      other_count: 1,
      average_age: 32.4,
    });

    await expect(fetchCustomerSummaryStats()).resolves.toEqual({
      totalClients: 10,
      newThisMonth: 2,
      maleCount: 4,
      femaleCount: 5,
      otherCount: 1,
      averageAge: 32.4,
    });
    expect(bffRequest).toHaveBeenCalledWith("/api/customers/summary-stats");
  });
});
