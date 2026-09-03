import { cleanup, render, screen } from "@testing-library/react";
import { History } from "lucide-react";
import { afterEach, describe, expect, it } from "vitest";

import { ActivityFeed } from "@/components/feed/activity-feed";

afterEach(() => {
  cleanup();
});

describe("ActivityFeed", () => {
  it("renders activity rows without date group separators", () => {
    const now = new Date("2026-09-03T12:00:00");

    render(
      <ActivityFeed
        title="Activity"
        description="A timeline of events recorded for this client."
        now={now}
        items={[
          {
            id: "1",
            title: "Claim created",
            summary: "Claim created for visit",
            occurredAt: "2026-09-03T10:00:00",
            icon: History,
            createdByName: "Jane Doe",
            groupKey: "CLAIM_CREATED",
          },
          {
            id: "2",
            title: "Visit updated",
            summary: "Visit updated",
            occurredAt: "2026-09-02T18:00:00",
            icon: History,
            createdByName: "System",
            groupKey: "VISIT_UPDATED",
          },
        ]}
      />,
    );

    expect(screen.getByTestId("activity-feed")).toBeInTheDocument();
    expect(screen.getByText("Activity")).toBeInTheDocument();
    expect(screen.getByText("Claim created")).toBeInTheDocument();
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.queryByTestId("activity-date-group")).not.toBeInTheDocument();
    expect(screen.queryByText("Today")).not.toBeInTheDocument();
    expect(screen.queryByText("Yesterday")).not.toBeInTheDocument();
  });

  it("shows an empty state when there is no activity", () => {
    render(
      <ActivityFeed
        title="Activity"
        items={[]}
        emptyTitle="No activity yet"
        emptyDescription="Events will appear here."
      />,
    );

    expect(screen.getByTestId("activity-feed-empty")).toBeInTheDocument();
    expect(screen.getByText("No activity yet")).toBeInTheDocument();
  });
});
