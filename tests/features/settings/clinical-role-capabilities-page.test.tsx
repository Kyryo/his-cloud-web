import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ClinicalRoleCapabilitiesSettingsPage } from "@/features/settings/pages/ClinicalRoleCapabilitiesSettingsPage";

const useUser = vi.fn();
const useRoleCapabilities = vi.fn();
const mutateAsync = vi.fn();

vi.mock("@/providers/user-provider", () => ({
  useUser: () => useUser(),
}));

vi.mock("@/features/clinical-opd/hooks/use-clinical-opd", () => ({
  useRoleCapabilities: () => useRoleCapabilities(),
  useUpdateRoleCapabilities: () => ({ mutateAsync }),
}));

afterEach(() => {
  cleanup();
  useUser.mockReset();
  useRoleCapabilities.mockReset();
  mutateAsync.mockReset();
});

describe("ClinicalRoleCapabilitiesSettingsPage", () => {
  it("restricts the page for non-admins", () => {
    useUser.mockReturnValue({
      userData: { is_admin: false },
      isLoading: false,
    });
    useRoleCapabilities.mockReturnValue({ data: [], isLoading: false });

    render(<ClinicalRoleCapabilitiesSettingsPage />);

    expect(screen.getByText("Access restricted")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Back to account settings" }),
    ).toBeInTheDocument();
  });

  it("shows workspace and action groups for tenant admins", () => {
    useUser.mockReturnValue({
      userData: { is_admin: true },
      isLoading: false,
    });
    useRoleCapabilities.mockReturnValue({
      data: [
        {
          uuid: "1",
          user_role: "physician",
          capability: "prescribe",
        },
      ],
      isLoading: false,
    });

    render(<ClinicalRoleCapabilitiesSettingsPage />);

    expect(screen.getByText("Workspace tabs")).toBeInTheDocument();
    expect(screen.getByText("Actions")).toBeInTheDocument();
    expect(
      screen.getByRole("switch", { name: "Physicians: Prescriptions" }),
    ).toBeChecked();
    expect(
      screen.getByRole("switch", { name: "Nurses: Prescriptions" }),
    ).not.toBeChecked();
  });
});
