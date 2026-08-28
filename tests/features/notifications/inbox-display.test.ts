import { subDays } from "date-fns";
import { describe, expect, it } from "vitest";

import type { InboxItem } from "@/features/notifications/types/inbox.types";
import {
  groupInboxItemsByDate,
  inboxItemDescription,
  inboxModuleIcon,
  inboxModuleLabel,
} from "@/features/notifications/utils/inbox-display";

function buildItem(overrides: Partial<InboxItem> = {}): InboxItem {
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

describe("inbox display copy", () => {
  it("replaces a duplicated title/body with useful single-item context", () => {
    expect(inboxItemDescription(buildItem())).toBe(
      "The claim passed requirements and advisory checks and is ready to be submitted.",
    );
  });

  it("keeps bundled preview names as the description", () => {
    const item = buildItem({
      title: "20 claims are ready for submission",
      body: "Jane Doe and 19 others",
      item_count: 20,
    });
    expect(inboxItemDescription(item)).toBe("Jane Doe and 19 others");
  });

  it("uses existing module icons and labels", () => {
    expect(inboxModuleIcon("claims")).toBe("shield");
    expect(inboxModuleLabel("claims")).toBe("Claims");
    expect(inboxModuleIcon("billing")).toBe("wallet");
    expect(inboxModuleLabel("lab")).toBe("Laboratory");
    expect(inboxModuleIcon("payments")).toBe("creditCard");
    expect(inboxModuleLabel("")).toBe("General");
  });
});

describe("inbox date grouping", () => {
  it("groups items into Today, Yesterday, and Earlier this week", () => {
    const now = new Date(2026, 7, 26, 15, 0, 0);
    const groups = groupInboxItemsByDate(
      [
        buildItem({ id: 1, occurred_at: now.toISOString() }),
        buildItem({
          id: 2,
          occurred_at: subDays(now, 1).toISOString(),
        }),
        buildItem({
          id: 3,
          occurred_at: subDays(now, 2).toISOString(),
        }),
        buildItem({
          id: 4,
          occurred_at: subDays(now, 20).toISOString(),
        }),
      ],
      now,
    );

    expect(groups.map((group) => group.label)).toEqual([
      "Today",
      "Yesterday",
      "Earlier this week",
      "Earlier",
    ]);
    expect(groups[0]?.items).toHaveLength(1);
    expect(groups[3]?.items[0]?.id).toBe(4);
  });
});
