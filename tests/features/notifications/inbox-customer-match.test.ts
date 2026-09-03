import { describe, expect, it } from "vitest";

import type { InboxItem } from "@/features/notifications/types/inbox.types";
import {
  filterInboxItemsForCustomer,
  inboxItemMatchesCustomer,
} from "@/features/notifications/utils/inbox-customer-match";

function item(overrides: Partial<InboxItem> = {}): InboxItem {
  return {
    id: 1,
    uuid: "inbox-1",
    module: "claims",
    event_type: "ready_for_submission",
    title: "Claim for Jane Doe is ready for submission",
    body: "Claim for Jane Doe is ready for submission",
    preview_name: "Jane Doe",
    item_count: 1,
    object_id: "42",
    clinic_id: 1,
    is_read: false,
    read_at: null,
    occurred_at: "2026-08-26T10:00:00Z",
    href: "/claims/42",
    payload: {},
    ...overrides,
  };
}

describe("inbox-customer-match", () => {
  it("matches by preview name", () => {
    expect(
      inboxItemMatchesCustomer(item(), {
        full_name: "Jane Doe",
      }),
    ).toBe(true);
  });

  it("matches by payload customer id", () => {
    expect(
      inboxItemMatchesCustomer(
        item({
          preview_name: "Other",
          title: "Other",
          body: "Other",
          payload: { customer_id: 99 },
        }),
        { id: 99, full_name: "Someone Else" },
      ),
    ).toBe(true);
  });

  it("filters a list to the matching customer", () => {
    const results = filterInboxItemsForCustomer(
      [
        item({ id: 1, preview_name: "Jane Doe" }),
        item({
          id: 2,
          preview_name: "John Smith",
          title: "Claim for John Smith",
          body: "Claim for John Smith",
        }),
      ],
      { full_name: "Jane Doe" },
    );

    expect(results).toHaveLength(1);
    expect(results[0]?.id).toBe(1);
  });
});
