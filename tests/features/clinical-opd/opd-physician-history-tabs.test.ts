import { describe, expect, it } from "vitest";

import {
  isOpdPhysicianHistoryTab,
  OPD_PHYSICIAN_HISTORY_TAB_IDS,
} from "@/features/clinical-opd/utils/opd-physician-history-tabs";

describe("opd-physician-history-tabs", () => {
  it("shows the prior-visit rail on consult and plan tabs", () => {
    expect([...OPD_PHYSICIAN_HISTORY_TAB_IDS]).toEqual([
      "complaint",
      "physical-examination",
      "notes",
      "diagnoses",
      "problems",
      "medications",
      "orders",
      "disposition",
    ]);
    expect(isOpdPhysicianHistoryTab("complaint")).toBe(true);
    expect(isOpdPhysicianHistoryTab("physical-examination")).toBe(true);
    expect(isOpdPhysicianHistoryTab("overview")).toBe(false);
    expect(isOpdPhysicianHistoryTab("activity")).toBe(false);
    expect(isOpdPhysicianHistoryTab("client")).toBe(false);
    expect(isOpdPhysicianHistoryTab("vital-signs")).toBe(false);
  });
});
