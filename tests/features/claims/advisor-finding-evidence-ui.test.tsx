import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { ClaimAdvisoryFindingsCard } from "@/features/claims/components/ClaimAdvisoryFindingsCard";
import type { AdvisorFinding } from "@/features/claims/types/claims.types";

afterEach(() => {
  cleanup();
});

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
        tariff: {
          code: "21129",
          category_allowed_patient_genders: ["female"],
        },
      },
    ],
  },
};

describe("ClaimAdvisoryFindingsCard evidence", () => {
  it("opens findings by default and moves fix details into a dialog", () => {
    render(<ClaimAdvisoryFindingsCard findings={[genderMismatchFinding]} />);

    expect(
      screen.getByText("Patient gender incompatible with tariff category"),
    ).toBeInTheDocument();
    expect(screen.getByText("Rejection risk")).toBeInTheDocument();
    expect(
      screen.queryByText(
        "Confirm the patient's demographic details and the selected tariff before submission.",
      ),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("claim-advisory-finding-evidence"),
    ).not.toBeInTheDocument();

    fireEvent.click(
      screen.getByTestId("claim-advisory-fix-GLOBAL_PATIENT_GENDER_TARIFF_MISMATCH"),
    );

    expect(screen.getByTestId("claim-advisory-fix-dialog")).toBeInTheDocument();
    expect(screen.getByText("How to resolve")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Confirm the patient's demographic details and the selected tariff before submission.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByTestId("claim-advisory-finding-evidence")).toBeInTheDocument();
    expect(screen.getByText("Patient: male")).toBeInTheDocument();
    expect(screen.getByText("Pregnancy Test")).toBeInTheDocument();
    expect(screen.getByText("21129")).toBeInTheDocument();
    expect(screen.getByText("Category pregnancy_test")).toBeInTheDocument();
    expect(
      screen.getByText("Patient male · allowed female"),
    ).toBeInTheDocument();
  });

  it("still renders findings without evidence and opens a fix dialog", () => {
    const findings: AdvisorFinding[] = [
      {
        code: "SOME_GENERIC_RULE",
        name: "Generic rule",
        severity: "warning",
        category: "claim_quality",
        message: "Something looks off.",
        recommended_action: "Review the claim.",
      },
    ];

    render(<ClaimAdvisoryFindingsCard findings={findings} />);

    expect(screen.getByText("Generic rule")).toBeInTheDocument();
    expect(screen.getByText("Something looks off.")).toBeInTheDocument();
    expect(screen.queryByText("Review the claim.")).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("claim-advisory-fix-SOME_GENERIC_RULE"));

    expect(screen.getByTestId("claim-advisory-fix-dialog")).toBeInTheDocument();
    expect(screen.getByText("Review the claim.")).toBeInTheDocument();
    expect(
      screen.queryByTestId("claim-advisory-finding-evidence"),
    ).not.toBeInTheDocument();
  });

  it("shows at most five findings until show more is clicked", () => {
    const findings: AdvisorFinding[] = Array.from({ length: 7 }, (_, index) => ({
      code: `RULE_${index + 1}`,
      name: `Finding ${index + 1}`,
      severity: index < 3 ? "rejection_risk" : "warning",
      category: "claim_quality",
      message: `Message ${index + 1}`,
    }));

    render(<ClaimAdvisoryFindingsCard findings={findings} />);

    expect(screen.getByText("Finding 1")).toBeInTheDocument();
    expect(screen.getByText("Finding 5")).toBeInTheDocument();
    expect(screen.queryByText("Finding 6")).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("claim-advisory-findings-show-more"));
    expect(screen.getByText("Finding 6")).toBeInTheDocument();
    expect(screen.getByText("Finding 7")).toBeInTheDocument();
  });
});
