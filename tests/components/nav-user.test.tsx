import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { NavUser } from "@/components/nav-user";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ROUTES } from "@/constants/routes";

const logout = vi.fn();

vi.mock("@/features/auth/services/auth.service", () => ({
  logout: () => logout(),
}));

vi.mock("@/providers/user-provider", () => ({
  useUser: () => ({
    userData: {
      name: "Ada Lovelace",
      email: "ada@example.com",
      is_superuser: false,
      tenant: { id: 1 },
    },
    isLoading: false,
    refreshUser: vi.fn(),
  }),
}));

function renderNavUser() {
  return render(
    <SidebarProvider>
      <NavUser />
    </SidebarProvider>,
  );
}

describe("NavUser", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("opens a right-side account popover with account, pages, and logout", () => {
    renderNavUser();

    fireEvent.click(screen.getByTestId("sidebar-account-trigger"));

    const popover = screen.getByTestId("sidebar-account-popover");
    expect(popover).toBeInTheDocument();
    expect(popover).toHaveAttribute("data-side", "right");
    expect(popover).toHaveTextContent("Account");
    expect(popover).toHaveTextContent("Ada Lovelace");
    expect(popover).toHaveTextContent("ada@example.com");
    expect(screen.getByRole("link", { name: "Support" })).toHaveAttribute(
      "href",
      ROUTES.contacts,
    );
    expect(screen.getByRole("link", { name: "Settings" })).toHaveAttribute(
      "href",
      ROUTES.settings,
    );
    expect(screen.getByTestId("sidebar-account-logout")).toHaveTextContent(
      "Log out",
    );
  });

  it("signs out from the popover", () => {
    renderNavUser();

    fireEvent.click(screen.getByTestId("sidebar-account-trigger"));
    fireEvent.click(screen.getByTestId("sidebar-account-logout"));

    expect(logout).toHaveBeenCalledTimes(1);
  });
});
