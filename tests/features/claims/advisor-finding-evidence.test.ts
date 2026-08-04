import { describe, expect, it } from "vitest";

import type { AdvisorFinding } from "@/features/claims/types/claims.types";
import { getAdvisorFindingEvidenceDisplay } from "@/features/claims/utils/advisor-finding-evidence";

const genderMismatchFinding: AdvisorFinding = {
  code: "GLOBAL_PATIENT_GENDER_TARIFF_MISMATCH",
  name: "Patient gender incompatible with tariff category",
  severity: "rejection_risk",
  category: "claim_quality",
  message:
    "One or more selected tariff categories are not normally applicable to the patient's recorded gender.",
  recommended_action:
    "Confirm the patient's demographic details and the selected tariff before submission.",
  evidence: {
    patient_gender: "male",
    violating_lines: [
      {
        id: "line-1",
        procedure_code: "21129",
        description: "Pregnancy Test",
        category: "pregnancy_test",
        units: 1,
        charge_amount: "1500.00",
        tariff: {
          code: "21129",
          category: "pregnancy_test",
          category_allowed_patient_genders: ["female"],
          description: "Pregnancy test",
          amount: "1500.00",
        },
      },
    ],
  },
};

describe("getAdvisorFindingEvidenceDisplay", () => {
  it("formats gender mismatch violating lines with tariff and patient context", () => {
    const display = getAdvisorFindingEvidenceDisplay(genderMismatchFinding);

    expect(display).not.toBeNull();
    expect(display?.contextLabel).toBe("Patient: male");
    expect(display?.lines).toHaveLength(1);
    expect(display?.lines[0]?.summary).toBe(
      "Pregnancy Test (21129) · category pregnancy_test · patient male, allowed female",
    );
  });

  it("formats age mismatch and over-tariff evidence", () => {
    const ageDisplay = getAdvisorFindingEvidenceDisplay({
      evidence: {
        patient_age_years: 8,
        violating_lines: [
          {
            description: "Adult consult",
            procedure_code: "GP01",
            category: "adult_consult",
            tariff: {
              code: "GP01",
              category_min_age_years: 18,
            },
          },
        ],
      },
    });

    expect(ageDisplay?.contextLabel).toBe("Age: 8");
    expect(ageDisplay?.lines[0]?.summary).toContain("patient age 8, min age 18");

    const overTariffDisplay = getAdvisorFindingEvidenceDisplay({
      evidence: {
        over_tariff: [
          {
            description: "Scan",
            procedure_code: "US01",
            charge_amount: "20000",
            tariff: { code: "US01", amount: "15000" },
          },
        ],
      },
    });

    expect(overTariffDisplay?.lines[0]?.summary).toContain(
      "charged 20000, tariff 15000",
    );
  });

  it("returns null when evidence has no usable lines", () => {
    expect(getAdvisorFindingEvidenceDisplay({})).toBeNull();
    expect(
      getAdvisorFindingEvidenceDisplay({
        evidence: { patient_gender: "male", violating_lines: [] },
      }),
    ).toBeNull();
    expect(
      getAdvisorFindingEvidenceDisplay({
        evidence: { violating_lines: [null, "bad"] },
      }),
    ).toBeNull();
  });
});
