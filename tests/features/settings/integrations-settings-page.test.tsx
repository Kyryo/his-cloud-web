import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ROUTES } from "@/constants/routes";
import { IntegrationsSettingsPage } from "@/features/settings/pages/IntegrationsSettingsPage";

const useUser = vi.fn();

vi.mock("@/providers/user-provider", () => ({
  useUser: () => useUser(),
}));

afterEach(() => {
  cleanup();
  useUser.mockReset();
});

describe("IntegrationsSettingsPage", () => {
  it("restricts the page for non-admins", () => {
    useUser.mockReturnValue({
      userData: { is_admin: false },
      isLoading: false,
    });

    render(<IntegrationsSettingsPage />);

    expect(screen.getByText("Access restricted")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Back to account settings" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Email/ })).not.toBeInTheDocument();
  });

  it("lists integrations as sectioned rows", () => {
    useUser.mockReturnValue({
      userData: { is_admin: true },
      isLoading: false,
    });

    render(<IntegrationsSettingsPage />);

    expect(screen.getByRole("heading", { name: "Communication" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Insurance" })).toBeInTheDocument();

    expect(screen.getByRole("link", { name: /Email/ })).toHaveAttribute(
      "href",
      ROUTES.settingsIntegrationsEmail,
    );
    expect(screen.getByRole("link", { name: /MASM eClaims/ })).toHaveAttribute(
      "href",
      ROUTES.settingsIntegrationsMasemEclaims,
    );
    expect(screen.getByText("Malawi")).toBeInTheDocument();
  });
});
