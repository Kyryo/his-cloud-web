import { describe, expect, it } from "vitest";

import {
  getVisibleStockAdjustmentDocumentActions,
  isStockAdjustmentOwner,
} from "@/features/inventory/utils/stock-adjustment-document-actions";

describe("isStockAdjustmentOwner", () => {
  it("returns true when the current user created the adjustment", () => {
    expect(isStockAdjustmentOwner({ created_by: 4 }, 4)).toBe(true);
  });
});

describe("getVisibleStockAdjustmentDocumentActions", () => {
  it("shows cancel before the primary submit action in draft", () => {
    expect(
      getVisibleStockAdjustmentDocumentActions(
        { status: "DRAFT", created_by: 4 },
        4,
      ),
    ).toEqual(["cancel", "submit"]);
  });

  it("hides approve and reject from the owner by default when submitted", () => {
    expect(
      getVisibleStockAdjustmentDocumentActions(
        { status: "SUBMITTED", created_by: 4 },
        4,
      ),
    ).toEqual(["cancel"]);
  });

  it("shows cancel before the primary approve action when self-approval is enabled", () => {
    expect(
      getVisibleStockAdjustmentDocumentActions(
        {
          status: "SUBMITTED",
          created_by: 4,
          allow_self_approval: true,
        },
        4,
      ),
    ).toEqual(["cancel", "approve"]);
  });

  it("shows cancel and reject before approve for non-owners when submitted", () => {
    expect(
      getVisibleStockAdjustmentDocumentActions(
        { status: "SUBMITTED", created_by: 4 },
        9,
      ),
    ).toEqual(["cancel", "reject", "approve"]);
  });

  it("shows apply when approved", () => {
    expect(
      getVisibleStockAdjustmentDocumentActions(
        { status: "APPROVED", created_by: 4 },
        4,
      ),
    ).toEqual(["apply", "cancel"]);
  });
});
