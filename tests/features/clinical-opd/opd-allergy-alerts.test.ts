import { describe, expect, it } from "vitest";

import { formatAllergyAlertMessage } from "@/features/clinical-opd/utils/opd-allergy-alerts";

describe("opd-allergy-alerts", () => {
  it("formats warning copy without treating alerts as errors", () => {
    expect(
      formatAllergyAlertMessage([
        {
          allergy_name: "Penicillin",
          severity: "severe",
          match: "amoxicillin",
        },
      ]),
    ).toBe("Penicillin (severe)");
  });
});
