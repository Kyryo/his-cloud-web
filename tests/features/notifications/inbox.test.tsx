import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { subDays } from "date-fns";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { NavMain } from "@/components/nav-main";
import { SidebarProvider } from "@/components/ui/sidebar";
import { InboxActivityFeed } from "@/features/notifications/components/InboxActivityFeed";
import { useInboxUnreadCount } from "@/features/notifications/hooks/use-inbox-unread-count";
import { NotificationsInboxPage } from "@/features/notifications/pages/NotificationsInboxPage";
import type { InboxItem } from "@/features/notifications/types/inbox.types";

const fetchInboxItems = vi.fn();
const fetchInboxUnreadCount = vi.fn();
const markInboxItemRead = vi.fn();
const markAllInboxItemsRead = vi.fn();
const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  usePathname: () => "/customers",
}));

const { toastMock } = vi.hoisted(() => ({ toastMock: vi.fn() }));

vi.mock("@/providers/toast-provider", () => ({
  useToast: () => ({
    toast: toastMock,
    dismiss: vi.fn(),
  }),
}));

vi.mock("@/features/notifications/services/inbox.service", () => ({
  fetchInboxItems: (...args: unknown[]) => fetchInboxItems(...args),
  fetchInboxUnreadCount: (...args: unknown[]) => fetchInboxUnreadCount(...args),
  markInboxItemRead: (...args: unknown[]) => markInboxItemRead(...args),
  markAllInboxItemsRead: (...args: unknown[]) => markAllInboxItemsRead(...args),
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

describe("NavMain unread dot", () => {
  it("shows a subtle unread dot when showUnreadDot is true", () => {
    render(
      <SidebarProvider>
        <NavMain
          items={[
            {
              title: "Notifications",
              url: "/notifications",
              icon: "notification",
              showUnreadDot: true,
              section: "workspace",
            },
          ]}
        />
      </SidebarProvider>,
    );

    expect(screen.getByTestId("nav-unread-dot")).toBeInTheDocument();
  });

  it("hides the unread dot when there are no unread items", () => {
    render(
      <SidebarProvider>
        <NavMain
          items={[
            {
              title: "Notifications",
              url: "/notifications",
              icon: "notification",
              showUnreadDot: false,
              section: "workspace",
            },
          ]}
        />
      </SidebarProvider>,
    );

    expect(screen.queryByTestId("nav-unread-dot")).not.toBeInTheDocument();
  });
});

describe("NotificationsInboxPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchInboxItems.mockResolvedValue({
      results: [
        buildItem(),
        buildItem({
          id: 2,
          title: "20 claims are ready for submission",
          body: "Jane Doe and 19 others",
          item_count: 20,
          object_id: "",
          href: "/claims?status=draft&attention=ready",
        }),
      ],
      pagination: { count: 2, next: null, previous: null },
    });
    markInboxItemRead.mockResolvedValue(buildItem({ is_read: true }));
  });

  it("renders bundled copy and navigates using resolver hrefs", async () => {
    render(<NotificationsInboxPage />);

    await waitFor(() => {
      expect(screen.getByText("20 claims are ready for submission")).toBeInTheDocument();
    });
    expect(screen.getByText("Jane Doe and 19 others")).toBeInTheDocument();

    const rows = screen.getAllByTestId("inbox-item");
    expect(rows[0]).toHaveAttribute("data-href", "/claims/42");
    expect(rows[1]).toHaveAttribute(
      "data-href",
      "/claims?status=draft&attention=ready",
    );

    fireEvent.click(rows[0]);
    await waitFor(() => {
      expect(markInboxItemRead).toHaveBeenCalledWith(1);
    });
    expect(push).toHaveBeenCalledWith("/claims/42");
  });

  it("shows contextual description instead of repeating the title", async () => {
    render(<NotificationsInboxPage />);

    await waitFor(() => {
      expect(
        screen.getByText("Claim for Jane Doe is ready for submission"),
      ).toBeInTheDocument();
    });
    expect(
      screen.getByText(
        "The claim passed requirements and advisory checks and is ready to be submitted.",
      ),
    ).toBeInTheDocument();
    expect(screen.getAllByTestId("inbox-item-unread-dot")).toHaveLength(2);
  });

  it("renders a compact empty state when there are no notifications", async () => {
    fetchInboxItems.mockResolvedValue({
      results: [],
      pagination: { count: 0, next: null, previous: null },
    });

    render(<NotificationsInboxPage />);

    await waitFor(() => {
      expect(screen.getByTestId("inbox-empty-state")).toBeInTheDocument();
    });
    expect(screen.getByText("You're all caught up")).toBeInTheDocument();
    expect(
      screen.getByText("You don't have any new notifications right now."),
    ).toBeInTheDocument();
  });
});

describe("InboxActivityFeed", () => {
  it("groups notifications with date separators", () => {
    const now = new Date(2026, 7, 26, 15, 0, 0);
    render(
      <InboxActivityFeed
        now={now}
        onOpen={() => undefined}
        items={[
          buildItem({
            id: 1,
            occurred_at: now.toISOString(),
          }),
          buildItem({
            id: 2,
            title: "Claim for John Chawinga is ready for submission",
            is_read: true,
            occurred_at: subDays(now, 1).toISOString(),
          }),
        ]}
      />,
    );

    const groups = screen.getAllByTestId("inbox-date-group");
    expect(groups.map((group) => group.getAttribute("data-group"))).toEqual([
      "Today",
      "Yesterday",
    ]);
    expect(screen.getByTestId("inbox-item-unread-dot")).toBeInTheDocument();
  });
});

describe("useInboxUnreadCount", () => {
  const listeners: Record<string, () => void> = {};

  beforeEach(() => {
    vi.clearAllMocks();
    toastMock.mockReset();
    Object.keys(listeners).forEach((key) => {
      delete listeners[key];
    });
    vi.stubGlobal(
      "EventSource",
      class {
        addEventListener(type: string, cb: () => void) {
          listeners[type] = cb;
        }
        close() {}
      },
    );
  });

  it("toasts when a new unread notification arrives over SSE", async () => {
    fetchInboxUnreadCount
      .mockResolvedValueOnce({ count: 0, latest: null })
      .mockResolvedValue({
        count: 1,
        latest: buildItem(),
      });

    function Probe() {
      const count = useInboxUnreadCount(true, { notifyOnNew: true });
      return <div data-testid="unread-count">{count}</div>;
    }

    render(<Probe />);

    await waitFor(() => {
      expect(fetchInboxUnreadCount).toHaveBeenCalledTimes(1);
    });
    expect(toastMock).not.toHaveBeenCalled();

    listeners.inbox?.();

    await waitFor(() => {
      expect(toastMock).toHaveBeenCalled();
    });
    expect(toastMock).toHaveBeenCalledWith(
      expect.objectContaining({
        variant: "info",
        title: "Claim for Jane Doe is ready for submission",
      }),
    );
  });
});
