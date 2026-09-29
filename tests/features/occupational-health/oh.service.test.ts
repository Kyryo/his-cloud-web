import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  fetchEmploymentEpisodes,
  fetchOhCampaignQueue,
  fetchOhComplianceDashboard,
  fetchOhEncounters,
} from "@/features/occupational-health/services/oh.service";
import { bffRequest } from "@/lib/bff-client";

vi.mock("@/lib/bff-client", () => ({
  bffRequest: vi.fn(),
}));

describe("occupational health service", () => {
  beforeEach(() => {
    vi.mocked(bffRequest).mockReset();
  });

  it("requests the OH encounters BFF route", async () => {
    vi.mocked(bffRequest).mockResolvedValueOnce({ results: [] });

    await fetchOhEncounters({ page: 2, pageSize: 50 });

    expect(bffRequest).toHaveBeenCalledWith(
      "/api/occupational-health/encounters?page=2&page_size=50",
    );
  });

  it("filters employment episodes by customer uuid", async () => {
    vi.mocked(bffRequest).mockResolvedValueOnce({ results: [] });

    await fetchEmploymentEpisodes("cust-uuid-1");

    expect(bffRequest).toHaveBeenCalledWith(
      "/api/occupational-health/employment-episodes?customer=cust-uuid-1",
    );
  });

  it("requests compliance dashboard metrics", async () => {
    vi.mocked(bffRequest).mockResolvedValueOnce({ due: 1, overdue: 0 });

    await fetchOhComplianceDashboard();

    expect(bffRequest).toHaveBeenCalledWith(
      "/api/occupational-health/compliance/dashboard",
    );
  });

  it("requests the OH campaign queue BFF route", async () => {
    vi.mocked(bffRequest).mockResolvedValueOnce([]);

    await fetchOhCampaignQueue();

    expect(bffRequest).toHaveBeenCalledWith(
      "/api/occupational-health/campaign-queue",
    );
  });
});
