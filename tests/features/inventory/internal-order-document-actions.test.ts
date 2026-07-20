import { describe, expect, it } from "vitest";

import {
  getVisibleInternalOrderDocumentActions,
  isInternalOrderOwner,
} from "@/features/inventory/utils/internal-order-document-actions";

describe("isInternalOrderOwner", () => {
  it("returns true when the current user created the order", () => {
    expect(isInternalOrderOwner({ created_by: 3 }, 3)).toBe(true);
  });
});

describe("getVisibleInternalOrderDocumentActions", () => {
  it("shows submit and cancel to the owner in draft", () => {
    expect(
      getVisibleInternalOrderDocumentActions(
        { status: "DRAFT", created_by: 3 },
        3,
      ),
    ).toEqual(["cancel", "submit"]);
  });

  it("shows approve and reject to non-owners when submitted", () => {
    expect(
      getVisibleInternalOrderDocumentActions(
        { status: "SUBMITTED", created_by: 3 },
        9,
      ),
    ).toEqual(["reject", "approve"]);
  });

  it("shows approve to the owner when self-approval is enabled", () => {
    expect(
      getVisibleInternalOrderDocumentActions(
        {
          status: "SUBMITTED",
          created_by: 3,
          allow_self_approval: true,
        },
        3,
      ),
    ).toEqual(["cancel", "approve"]);
  });

  it("keeps reject hidden for owners even when self-approval is enabled", () => {
    expect(
      getVisibleInternalOrderDocumentActions(
        {
          status: "SUBMITTED",
          created_by: 3,
          allow_self_approval: true,
        },
        3,
      ),
    ).not.toContain("reject");
  });

  it("shows dispatch and receive at the later workflow stages", () => {
    expect(
      getVisibleInternalOrderDocumentActions(
        { status: "APPROVED", created_by: 3 },
        3,
      ),
    ).toEqual(["dispatch"]);

    expect(
      getVisibleInternalOrderDocumentActions(
        { status: "DISPATCHED", created_by: 3 },
        9,
      ),
    ).toEqual(["receive"]);
  });
});
