import { describe, expect, it } from "vitest";

import { formatVisitPaymentModeLabel } from "@/features/visits/utils/format-visit-payment-mode";

describe("formatVisitPaymentModeLabel", () => {
  it("labels free visits", () => {
    expect(
      formatVisitPaymentModeLabel({
        mode_of_payment: "free",
        insurance_scheme_name: null,
      }),
    ).toBe("Free");
  });

  it("labels cash visits", () => {
    expect(
      formatVisitPaymentModeLabel({
        mode_of_payment: "cash",
        insurance_scheme_name: null,
      }),
    ).toBe("Cash");
  });

  it("labels insurance visits with scheme", () => {
    expect(
      formatVisitPaymentModeLabel({
        mode_of_payment: "insurance",
        insurance_scheme_name: "MASM Essential",
      }),
    ).toBe("Insurance · MASM Essential");
  });
});
