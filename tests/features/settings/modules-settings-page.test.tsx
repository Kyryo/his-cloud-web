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

  it("lists every module as a navigable settings link", () => {
    useUser.mockReturnValue({
      userData: { is_admin: true },
      isLoading: false,
    });

    render(<ModulesSettingsPage />);

    expect(screen.getByRole("heading", { name: "Operational modules" })).toBeInTheDocument();
    expect(screen.queryByText("Coming soon")).not.toBeInTheDocument();

    expect(screen.getByRole("link", { name: /Inventory/ })).toHaveAttribute(
      "href",
      ROUTES.settingsModuleInventory,
    );
    expect(screen.getByRole("link", { name: /Pharmacy/ })).toHaveAttribute(
      "href",
      ROUTES.settingsModulePharmacy,
    );
    expect(screen.getByRole("link", { name: /Laboratory/ })).toHaveAttribute(
      "href",
      ROUTES.settingsModuleLaboratory,
    );
    expect(screen.getByRole("link", { name: /Front Desk/ })).toHaveAttribute(
      "href",
      ROUTES.settingsModule("registration"),
    );
    expect(screen.getByRole("link", { name: /Billing/ })).toHaveAttribute(
      "href",
      ROUTES.settingsModule("billing"),
    );
  });
});
