import { describe, expect, it } from "vitest";

import {
  isOpdPhysicianHistoryTab,
  OPD_PHYSICIAN_HISTORY_TAB_IDS,
} from "@/features/clinical-opd/utils/opd-physician-history-tabs";

describe("opd-physician-history-tabs", () => {
  it("includes physician clinical work tabs only", () => {
    expect([...OPD_PHYSICIAN_HISTORY_TAB_IDS]).toEqual([
      "physical-examination",
      "orders",
      "diagnoses",
      "medications",
    ]);
    expect(isOpdPhysicianHistoryTab("physical-examination")).toBe(true);
    expect(isOpdPhysicianHistoryTab("activity")).toBe(false);
    expect(isOpdPhysicianHistoryTab("client")).toBe(false);
    expect(isOpdPhysicianHistoryTab("vital-signs")).toBe(false);
  });
});
