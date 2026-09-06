import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ROUTES } from "@/constants/routes";
import { ModulesSettingsPage } from "@/features/settings/pages/ModulesSettingsPage";

const useUser = vi.fn();

vi.mock("@/providers/user-provider", () => ({
  useUser: () => useUser(),
}));

afterEach(() => {
  cleanup();
  useUser.mockReset();
});

describe("ModulesSettingsPage", () => {
  it("restricts the page for non-admins", () => {
    useUser.mockReturnValue({
      userData: { is_admin: false },
      isLoading: false,
    });

    render(<ModulesSettingsPage />);

    expect(screen.getByText("Access restricted")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Back to account settings" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Inventory/ })).not.toBeInTheDocument();
  });

  it("lists configurable modules as links and upcoming modules as text", () => {
    useUser.mockReturnValue({
      userData: { is_admin: true },
      isLoading: false,
    });

    render(<ModulesSettingsPage />);

    expect(screen.getByRole("heading", { name: "Configurable" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Coming soon" })).toBeInTheDocument();

    expect(screen.getByRole("link", { name: /Inventory/ })).toHaveAttribute(
      "href",
      ROUTES.settingsModuleInventory,
    );
    expect(screen.getByRole("link", { name: /Pharmacy/ })).toHaveAttribute(
      "href",
      ROUTES.settingsModulePharmacy,
    );

    expect(screen.getByText("Front Desk")).toBeInTheDocument();
    expect(screen.getByText("Billing")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Front Desk/ })).not.toBeInTheDocument();
    expect(screen.getAllByText("Coming soon").length).toBeGreaterThan(1);
  });
});
