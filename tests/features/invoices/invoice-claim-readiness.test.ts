import { describe, expect, it } from "vitest";

import {
  getCreateClaimChecklistItems,
  getCreateClaimDisabledReasonFromItems,
} from "@/features/invoices/utils/invoice-claim-readiness";

describe("create claim checklist helpers", () => {
  const readinessItems = [
    { label: "Invoice is posted", met: true },
    { label: "MASM connection is configured", met: false },
  ];
  const requirementItems = [
    { label: "All line items have tariff codes", met: true },
    { label: "Membership number is recorded", met: true },
  ];

  it("includes system readiness before a claim exists", () => {
    const checklist = getCreateClaimChecklistItems(
      readinessItems,
      requirementItems,
      null,
    );
    expect(checklist).toHaveLength(4);
    expect(checklist[0].label).toBe("Invoice is posted");
  });

  it("returns a specific disabled reason for unmet system checks", () => {
    const reason = getCreateClaimDisabledReasonFromItems(
      readinessItems,
      requirementItems,
      null,
    );
    expect(reason).toContain("MASM connection is configured");
  });
});
