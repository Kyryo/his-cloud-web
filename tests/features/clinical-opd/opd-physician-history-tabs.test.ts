import { describe, expect, it } from "vitest";

import {
  isOpdPhysicianHistoryTab,
  opdHistorySectionForTab,
  OPD_PHYSICIAN_HISTORY_TAB_IDS,
} from "@/features/clinical-opd/utils/opd-physician-history-tabs";

describe("opd-physician-history-tabs", () => {
  it("uses the three-column layout on the five consult steps", () => {
    expect([...OPD_PHYSICIAN_HISTORY_TAB_IDS]).toEqual([
      "complaint",
      "physical-examination",
      "orders",
      "diagnoses",
      "medications",
    ]);
    expect(isOpdPhysicianHistoryTab("complaint")).toBe(true);
    expect(isOpdPhysicianHistoryTab("physical-examination")).toBe(true);
    expect(isOpdPhysicianHistoryTab("overview")).toBe(false);
    expect(isOpdPhysicianHistoryTab("activity")).toBe(false);
    expect(isOpdPhysicianHistoryTab("client")).toBe(false);
    expect(isOpdPhysicianHistoryTab("vital-signs")).toBe(false);
  });

  it("maps each consult tab to the matching history section", () => {
    expect(opdHistorySectionForTab("complaint")).toBe("complaint");
    expect(opdHistorySectionForTab("physical-examination")).toBe("exam");
    expect(opdHistorySectionForTab("orders")).toBe("orders");
    expect(opdHistorySectionForTab("diagnoses")).toBe("diagnoses");
    expect(opdHistorySectionForTab("medications")).toBe("medications");
  });
});
