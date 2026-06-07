import { describe, expect, it } from "vitest";

import {
  ERP_SYNC_LABELS,
  formatErpSyncStatus,
} from "@/features/customers/constants/customer-sync-labels";

describe("customer-sync-labels", () => {
  it("uses ERP terminology for synced states", () => {
    expect(formatErpSyncStatus(true)).toBe(ERP_SYNC_LABELS.synced);
    expect(formatErpSyncStatus(false)).toBe(ERP_SYNC_LABELS.notSynced);
  });
});
