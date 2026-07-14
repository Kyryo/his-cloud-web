import { describe, expect, it, vi } from "vitest";

import { updateVisitPaymentMode } from "@/features/visits/services/visits.service";
import { bffRequest } from "@/lib/bff-client";

vi.mock("@/lib/bff-client", () => ({
  bffRequest: vi.fn(),
}));

describe("visits.service", () => {
  it("updates visit payment mode via BFF route", async () => {
    vi.mocked(bffRequest).mockResolvedValue({
      uuid: "visit-uuid",
      mode_of_payment: "insurance",
    });

    await updateVisitPaymentMode("visit-uuid", {
      mode_of_payment: "insurance",
      insurance_scheme: "00000000-0000-0000-0000-000000000001",
    });

    expect(bffRequest).toHaveBeenCalledWith(
      "/api/visits/visit-uuid/mode-of-payment",
      {
        method: "PATCH",
        body: {
          mode_of_payment: "insurance",
          insurance_scheme: "00000000-0000-0000-0000-000000000001",
        },
      },
    );
  });
});
