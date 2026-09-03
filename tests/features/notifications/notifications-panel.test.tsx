import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { NotificationsPanel } from "@/features/notifications/components/NotificationsPanel";
import type { InboxItem } from "@/features/notifications/types/inbox.types";

const fetchInboxItems = vi.fn();
const markInboxItemRead = vi.fn();
const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  usePathname: () => "/customers/1",
}));

vi.mock("@/features/notifications/services/inbox.service", () => ({
  fetchInboxItems: (...args: unknown[]) => fetchInboxItems(...args),
  markInboxItemRead: (...args: unknown[]) => markInboxItemRead(...args),
  markAllInboxItemsRead: vi.fn(),
  fetchInboxUnreadCount: vi.fn(),
}));

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

afterEach(() => {
  cleanup();
});

describe("NotificationsPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchInboxItems.mockResolvedValue({
      results: [
        buildItem(),
        buildItem({
          id: 2,
          preview_name: "John Smith",
          title: "Claim for John Smith needs attention",
          body: "Review findings",
          href: "/claims/99",
        }),
      ],
      pagination: { count: 2, next: null, previous: null },
    });
    markInboxItemRead.mockResolvedValue(buildItem({ is_read: true }));
  });

  it("filters notifications to the selected customer", async () => {
    render(
      <NotificationsPanel
        customer={{ full_name: "Jane Doe", id: 10 }}
        data-testid="customer-notifications-panel"
      />,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId("customer-notifications-panel"),
      ).toBeInTheDocument();
    });

    expect(
      screen.getByText("Claim for Jane Doe is ready for submission"),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Claim for John Smith needs attention"),
    ).not.toBeInTheDocument();
    expect(screen.getByTestId("notifications-panel-unread-count")).toHaveTextContent(
      "1",
    );
  });

  it("opens a notification and marks it read", async () => {
    render(
      <NotificationsPanel customer={{ full_name: "Jane Doe", id: 10 }} />,
    );

    await waitFor(() => {
      expect(screen.getByTestId("inbox-item")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("inbox-item"));

    await waitFor(() => {
      expect(markInboxItemRead).toHaveBeenCalledWith(1);
    });
    expect(push).toHaveBeenCalledWith("/claims/42");
  });
});
