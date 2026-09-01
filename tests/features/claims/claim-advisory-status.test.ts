import { describe, expect, it } from "vitest";

import type { ClaimDetail } from "@/features/claims/types/claims.types";
import {
  isAdvisoryStatusSnapshotProcessing,
  mergeClaimWithAdvisoryStatus,
} from "@/features/claims/utils/claim-advisory-status";

const baseClaim = {
  id: 17,
  advisory_status: "processing",
  has_blocking_advisories: false,
  has_advisory_override: false,
  latest_advisor_evaluation: {
    id: 1,
    public_id: "eval-1",
    claim: 17,
    status: "completed",
    selected_validation_codes: [],
    deterministic_findings: [{ code: "OLD", severity: "warning" }],
    ai_findings: [],
    deterministic_count: 1,
    ai_count: 0,
    evaluated_by: null,
    created_at: "2026-01-01T00:00:00Z",
  },
} as ClaimDetail;

describe("claim advisory status helpers", () => {
  it("detects processing snapshots", () => {
    expect(
      isAdvisoryStatusSnapshotProcessing({
        advisory_status: "processing",
        latest_advisor_evaluation: { id: 1, status: "completed", deterministic_count: 0, ai_count: 0 },
      }),
    ).toBe(true);
    expect(
      isAdvisoryStatusSnapshotProcessing({
        advisory_status: "completed",
        latest_advisor_evaluation: { id: 1, status: "completed", deterministic_count: 1, ai_count: 0 },
      }),
    ).toBe(false);
  });

  it("merges lightweight snapshots into the cached claim", () => {
    const merged = mergeClaimWithAdvisoryStatus(baseClaim, {
      advisory_status: "processing",
      has_blocking_advisories: true,
      has_advisory_override: false,
      latest_advisor_evaluation: {
        id: 2,
        status: "pending_ai",
        deterministic_count: 0,
        ai_count: 0,
      },
    });

    expect(merged.advisory_status).toBe("processing");
    expect(merged.has_blocking_advisories).toBe(true);
    expect(merged.latest_advisor_evaluation?.id).toBe(2);
    expect(merged.latest_advisor_evaluation?.status).toBe("pending_ai");
    expect(merged.latest_advisor_evaluation?.deterministic_findings).toEqual([
      { code: "OLD", severity: "warning" },
    ]);
  });
});
