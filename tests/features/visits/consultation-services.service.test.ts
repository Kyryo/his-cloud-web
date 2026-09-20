import { beforeEach, describe, expect, it, vi } from "vitest";

import { BFF_CLINICAL_ROUTES } from "@/constants/api";
import { fetchDepartmentConsultationServices } from "@/features/visits/services/consultation-services.service";
import { bffRequest } from "@/lib/bff-client";

vi.mock("@/lib/bff-client", () => ({
  bffRequest: vi.fn(),
}));

describe("fetchDepartmentConsultationServices", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads consultation services for a department", async () => {
    vi.mocked(bffRequest).mockResolvedValueOnce({
      results: [{ uuid: "svc-1", name: "General consultation" }],
    });

    const results = await fetchDepartmentConsultationServices("dept-1");

    expect(bffRequest).toHaveBeenCalledWith(
      BFF_CLINICAL_ROUTES.departmentConsultationServices("dept-1"),
    );
    expect(results).toEqual([
      { uuid: "svc-1", name: "General consultation" },
    ]);
  });
});
