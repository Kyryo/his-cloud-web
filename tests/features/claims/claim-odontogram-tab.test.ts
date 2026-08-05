import { describe, expect, it } from "vitest";

import { formatToothNumbersSummary } from "@/features/dental/lib/dental-teeth-display";
import { shouldShowClaimOdontogramTab } from "@/features/claims/utils/claim-odontogram-tab";

describe("claim odontogram tab helpers", () => {
  it("shows odontogram tab only for dental encounters", () => {
    expect(shouldShowClaimOdontogramTab({ has_dental_encounter: true })).toBe(
      true,
    );
    expect(shouldShowClaimOdontogramTab({ has_dental_encounter: false })).toBe(
      false,
    );
    expect(shouldShowClaimOdontogramTab({})).toBe(false);
  });

  it("formats tooth number summaries", () => {
    expect(formatToothNumbersSummary([])).toBe("No teeth selected");
    expect(formatToothNumbersSummary([16, 26])).toBe("16, 26");
    expect(formatToothNumbersSummary([11, 12, 13, 14])).toBe("11, 12 and 2 more");
  });
});
