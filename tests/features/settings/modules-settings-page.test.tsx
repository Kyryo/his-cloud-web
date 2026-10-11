import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ROUTES } from "@/constants/routes";
import { ModulesSettingsPage } from "@/features/settings/pages/ModulesSettingsPage";

const { useUser, activateOrganizationModule, syncOrganizationModules, toast } = vi.hoisted(() => ({
  useUser: vi.fn(),
  activateOrganizationModule: vi.fn(),
  syncOrganizationModules: vi.fn(),
  toast: vi.fn(),
}));

vi.mock("@/providers/user-provider", () => ({
  useUser: () => useUser(),
}));

vi.mock("@/providers/toast-provider", () => ({
  useToast: () => ({ toast }),
}));

vi.mock("@/features/settings/services/settings.service", () => ({
  activateOrganizationModule: (...args: unknown[]) =>
    activateOrganizationModule(...args),
  syncOrganizationModules: (...args: unknown[]) => syncOrganizationModules(...args),
}));

afterEach(() => {
  cleanup();
  useUser.mockReset();
  activateOrganizationModule.mockReset();
  syncOrganizationModules.mockReset();
  toast.mockReset();
});

describe("ModulesSettingsPage", () => {
  it("restricts the page for non-admins", () => {
    useUser.mockReturnValue({
      userData: { is_admin: false },
      isLoading: false,
      refreshUser: vi.fn(),
    });

    render(<ModulesSettingsPage />);

    expect(screen.getByText("Access restricted")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Back to account settings" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Inventory/ })).not.toBeInTheDocument();
  });

  it("links added modules and lets an admin add one that is missing", async () => {
    const refreshUser = vi.fn().mockResolvedValue(undefined);
    activateOrganizationModule.mockResolvedValue(undefined);
    syncOrganizationModules.mockResolvedValue(undefined);
    useUser.mockReturnValue({
      userData: {
        is_admin: true,
        enabled_modules: ["Registration", "Billing", "Inventory", "Dispensation", "Lab"],
      },
      isLoading: false,
      refreshUser,
    });

    render(<ModulesSettingsPage />);

    expect(screen.getByRole("heading", { name: "Operational modules" })).toBeInTheDocument();
    expect(screen.queryByText("Added")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Inventory/ })).toHaveAttribute(
      "href",
      ROUTES.settingsModuleInventory,
    );
    expect(screen.getByRole("link", { name: /Pharmacy/ })).toHaveAttribute(
      "href",
      ROUTES.settingsModulePharmacy,
    );
    expect(screen.queryByRole("link", { name: /Claims/ })).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("module-add-claims"));

    await waitFor(() => {
      expect(activateOrganizationModule).toHaveBeenCalledWith("Claims");
    });
    expect(await screen.findByRole("link", { name: /Claims/ })).toHaveAttribute(
      "href",
      ROUTES.settingsModule("claims"),
    );
    expect(screen.queryByTestId("module-add-claims")).not.toBeInTheDocument();
    expect(refreshUser).toHaveBeenCalled();
  });
});
