import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AppHeaderNotifications } from "@/features/app-shell/components/AppHeaderNotifications";
import type { InboxItem } from "@/features/notifications/types/inbox.types";

const fetchInboxItems = vi.fn();
const fetchInboxUnreadCount = vi.fn();
const markInboxItemRead = vi.fn();
const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  usePathname: () => "/overview",
}));

vi.mock("@/providers/toast-provider", () => ({
  useToast: () => ({
    toast: vi.fn(),
    dismiss: vi.fn(),
  }),
}));

vi.mock("@/features/notifications/services/inbox.service", () => ({
  fetchInboxItems: (...args: unknown[]) => fetchInboxItems(...args),
  fetchInboxUnreadCount: (...args: unknown[]) => fetchInboxUnreadCount(...args),
  markInboxItemRead: (...args: unknown[]) => markInboxItemRead(...args),
  markAllInboxItemsRead: vi.fn(),
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

describe("AppHeaderNotifications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal(
      "EventSource",
      class {
        addEventListener() {}
        close() {}
      },
    );
    fetchInboxUnreadCount.mockResolvedValue({ count: 3, latest: buildItem() });
    fetchInboxItems.mockResolvedValue({
      results: [buildItem()],
      pagination: { count: 1, next: null, previous: null },
    });
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("shows an unread badge and opens the inbox preview", async () => {
    render(<AppHeaderNotifications />);

    await waitFor(() => {
      expect(screen.getByTestId("app-header-notifications-badge")).toHaveTextContent(
        "3",
      );
    });

    fireEvent.click(screen.getByTestId("app-header-notifications-trigger"));

    await waitFor(() => {
      expect(screen.getByTestId("app-header-notifications-panel")).toBeInTheDocument();
    });
    expect(
      screen.getByText("Claim for Jane Doe is ready for submission"),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View all" })).toHaveAttribute(
      "href",
      "/notifications",
    );
  });
});
