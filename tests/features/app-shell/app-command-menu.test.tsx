import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AppCommandMenu } from "@/features/app-shell/components/AppCommandMenu";
import { ROUTES } from "@/constants/routes";
import type { CommandPaletteItem } from "@/features/app-shell/utils/build-command-palette-items";

const push = vi.fn();
const searchState = vi.hoisted(() => ({
  items: [] as CommandPaletteItem[],
  isSearching: false,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  usePathname: () => ROUTES.overview,
}));

vi.mock("@/providers/user-provider", () => ({
  useUser: () => ({
    userData: {
      groups: ["Registration"],
      is_admin: false,
      is_superuser: false,
      tenant: { id: 1 },
    },
    isLoading: false,
    refreshUser: vi.fn(),
  }),
}));

vi.mock("@/features/app-shell/hooks/use-command-palette-search", () => ({
  useCommandPaletteSearch: () => searchState,
}));

describe("AppCommandMenu", () => {
  beforeEach(() => {
    push.mockReset();
    searchState.items = [];
    searchState.isSearching = false;
    vi.stubGlobal(
      "ResizeObserver",
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("opens from the header trigger and navigates to a page", () => {
    render(<AppCommandMenu />);

    fireEvent.click(screen.getByTestId("app-command-menu-trigger"));

    expect(screen.getByTestId("app-command-menu-list")).toBeInTheDocument();
    expect(screen.getByText("Clients")).toBeInTheDocument();
    expect(screen.getByText("Notifications")).toBeInTheDocument();
    expect(screen.queryByText("Account")).not.toBeInTheDocument();
    expect(screen.queryByText("Organization")).not.toBeInTheDocument();
    expect(screen.queryByText("Settings")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("Clients"));

    expect(push).toHaveBeenCalledWith(ROUTES.customers);
  });

  it("renders a header search trigger and toggles with the keyboard shortcut", () => {
    render(<AppCommandMenu />);

    expect(screen.getByTestId("app-command-menu-trigger")).toBeInTheDocument();
    expect(screen.getByText("Search")).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "k", metaKey: true });
    expect(screen.getByTestId("app-command-menu-list")).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "k", metaKey: true });
    expect(screen.queryByTestId("app-command-menu-list")).not.toBeInTheDocument();
  });

  it("shows matching records in grouped sections while typing", async () => {
    vi.useFakeTimers();
    searchState.items = [
      {
        href: ROUTES.customerDetail("cust-1"),
        title: "Ada Lovelace",
        subtitle: "CL-001",
        group: "Clients",
        icon: "user",
      },
      {
        href: ROUTES.salesOrderDetail("so-1"),
        title: "SO001",
        subtitle: "Ada Lovelace",
        group: "Sales orders",
        icon: "file",
      },
      {
        href: ROUTES.invoiceDetail("inv-1"),
        title: "INV/2026/0001",
        subtitle: "Ada Lovelace",
        group: "Invoices",
        icon: "invoice",
      },
    ];

    render(<AppCommandMenu />);
    fireEvent.click(screen.getByTestId("app-command-menu-trigger"));

    fireEvent.change(
      screen.getByPlaceholderText("Search clients, orders, invoices…"),
      { target: { value: "Ada" } },
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(250);
    });

    expect(screen.getByText("CL-001")).toBeInTheDocument();
    expect(screen.getByText("SO001")).toBeInTheDocument();
    expect(screen.getByText("INV/2026/0001")).toBeInTheDocument();
    expect(screen.getByText("Sales orders")).toBeInTheDocument();
    expect(screen.getByText("Invoices")).toBeInTheDocument();
    expect(screen.getAllByText("Ada Lovelace").length).toBeGreaterThan(0);
    expect(screen.queryByText("Notifications")).not.toBeInTheDocument();
    expect(screen.queryByTestId("app-command-menu-loading")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("SO001"));
    expect(push).toHaveBeenCalledWith(ROUTES.salesOrderDetail("so-1"));
  });

  it("shows grouped skeletons while record search is pending", () => {
    render(<AppCommandMenu />);
    fireEvent.click(screen.getByTestId("app-command-menu-trigger"));

    fireEvent.change(
      screen.getByPlaceholderText("Search clients, orders, invoices…"),
      { target: { value: "Ada" } },
    );

    expect(screen.getByTestId("app-command-menu-loading")).toBeInTheDocument();
    expect(screen.getByText("Searching records")).toBeInTheDocument();
    expect(screen.getByText("Clients")).toBeInTheDocument();
    expect(screen.queryByText("Sales orders")).not.toBeInTheDocument();
    expect(screen.queryByText("No matching results.")).not.toBeInTheDocument();
  });
});
