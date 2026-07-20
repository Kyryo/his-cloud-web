import { describe, expect, it } from "vitest";

import {
  getVisiblePurchaseOrderDocumentActions,
  isPurchaseOrderOwner,
} from "@/features/inventory/utils/purchase-order-document-actions";

describe("isPurchaseOrderOwner", () => {
  it("returns true when the current user created the order", () => {
    expect(isPurchaseOrderOwner({ created_by: 7 }, 7)).toBe(true);
  });

  it("returns false when the current user did not create the order", () => {
    expect(isPurchaseOrderOwner({ created_by: 7 }, 9)).toBe(false);
  });
});

describe("getVisiblePurchaseOrderDocumentActions", () => {
  it("shows submit and cancel to the owner in draft", () => {
    expect(
      getVisiblePurchaseOrderDocumentActions(
        { status: "DRAFT", created_by: 7 },
        7,
      ),
    ).toEqual(["cancel", "submit"]);
  });

  it("hides draft actions from non-owners", () => {
    expect(
      getVisiblePurchaseOrderDocumentActions(
        { status: "DRAFT", created_by: 7 },
        9,
      ),
    ).toEqual([]);
  });

  it("shows cancel to the owner when submitted", () => {
    expect(
      getVisiblePurchaseOrderDocumentActions(
        { status: "SUBMITTED", created_by: 7 },
        7,
      ),
    ).toEqual(["cancel"]);
  });

  it("shows approve to the owner when self-approval is enabled", () => {
    expect(
      getVisiblePurchaseOrderDocumentActions(
        {
          status: "SUBMITTED",
          created_by: 7,
          allow_self_approval: true,
        },
        7,
      ),
    ).toEqual(["cancel", "approve"]);
  });

  it("keeps reject hidden for owners even when self-approval is enabled", () => {
    expect(
      getVisiblePurchaseOrderDocumentActions(
        {
          status: "SUBMITTED",
          created_by: 7,
          allow_self_approval: true,
        },
        7,
      ),
    ).not.toContain("reject");
  });

  it("shows approve and reject to non-owners when submitted", () => {
    expect(
      getVisiblePurchaseOrderDocumentActions(
        { status: "SUBMITTED", created_by: 7 },
        9,
      ),
    ).toEqual(["reject", "approve"]);
  });

  it("hides actions for terminal states", () => {
    expect(
      getVisiblePurchaseOrderDocumentActions(
        { status: "CONFIRMED", created_by: 7 },
        7,
      ),
    ).toEqual([]);
  });
});
