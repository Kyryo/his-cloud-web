import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AppCommandMenu } from "@/features/app-shell/components/AppCommandMenu";
import { ROUTES } from "@/constants/routes";

const push = vi.fn();

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

describe("AppCommandMenu", () => {
  beforeEach(() => {
    push.mockReset();
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
    vi.unstubAllGlobals();
  });

  it("opens the command list and navigates to a page", () => {
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

  it("toggles the menu with the keyboard shortcut", () => {
    render(<AppCommandMenu />);

    fireEvent.keyDown(window, { key: "k", metaKey: true });
    expect(screen.getByTestId("app-command-menu-list")).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "k", metaKey: true });
    expect(screen.queryByTestId("app-command-menu-list")).not.toBeInTheDocument();
  });
});
