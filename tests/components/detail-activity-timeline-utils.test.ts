import { describe, expect, it } from "vitest";
import { History } from "lucide-react";

import {
  clusterConsecutiveActivityItems,
  formatActivityClusterRange,
  formatActivityRelativeLabel,
  formatActivityTime,
  groupActivityItemsByDate,
  pluralizeActivityTitle,
  type DetailActivityTimelineItem,
} from "@/components/detail/detail-activity-timeline-utils";

function item(
  overrides: Partial<DetailActivityTimelineItem> &
    Pick<DetailActivityTimelineItem, "id" | "title" | "occurredAt">,
): DetailActivityTimelineItem {
  return {
    summary: overrides.summary ?? overrides.title,
    icon: History,
    groupKey: overrides.groupKey ?? overrides.title,
    ...overrides,
  };
}

describe("detail-activity-timeline-utils", () => {
  it("groups items into Today and Yesterday date sections", () => {
    const now = new Date("2026-09-03T12:00:00");
    const groups = groupActivityItemsByDate(
      [
        item({
          id: "1",
          title: "Claim submitted",
          occurredAt: "2026-09-03T10:00:00",
        }),
        item({
          id: "2",
          title: "Claim created",
          occurredAt: "2026-09-02T18:00:00",
        }),
      ],
      now,
    );

    expect(groups.map((group) => group.label)).toEqual(["Today", "Yesterday"]);
    expect(groups[0].items).toHaveLength(1);
    expect(groups[1].items).toHaveLength(1);
  });

  it("clusters consecutive identical activities", () => {
    const entries = clusterConsecutiveActivityItems([
      item({
        id: "a",
        title: "Claim advisories evaluated",
        groupKey: "CLAIM_ADVISORIES_EVALUATED",
        occurredAt: "2026-09-02T19:44:00",
      }),
      item({
        id: "b",
        title: "Claim advisories evaluated",
        groupKey: "CLAIM_ADVISORIES_EVALUATED",
        occurredAt: "2026-09-02T19:40:00",
      }),
      item({
        id: "c",
        title: "Claim submitted",
        groupKey: "CLAIM_SUBMITTED",
        occurredAt: "2026-09-02T18:00:00",
      }),
    ]);

    expect(entries).toHaveLength(2);
    expect(entries[0]).toMatchObject({
      kind: "cluster",
      items: [{ id: "a" }, { id: "b" }],
    });
    expect(entries[1]).toMatchObject({
      kind: "single",
      item: { id: "c" },
    });
  });

  it("formats compact cluster ranges and plural titles", () => {
    expect(
      formatActivityClusterRange([
        item({
          id: "a",
          title: "Claim advisories evaluated",
          occurredAt: "2026-09-02T19:44:00",
        }),
        item({
          id: "b",
          title: "Claim advisories evaluated",
          occurredAt: "2026-09-02T18:23:00",
        }),
      ]),
    ).toContain("between");

    expect(formatActivityTime("2026-09-02T19:44:00")).toMatch(/\d/);
    expect(pluralizeActivityTitle("Claim advisories evaluated", 7)).toBe(
      "7 Claim advisories evaluated",
    );
  });

  it("formats relative labels for today and upcoming", () => {
    const now = new Date("2026-09-03T12:00:00");

    expect(
      formatActivityRelativeLabel("2026-09-04T09:00:00", "Upcoming", now),
    ).toBe("Tomorrow");

    expect(
      formatActivityRelativeLabel("2026-09-03T10:00:00", "Today", now),
    ).toMatch(/ago$/);
  });
});
