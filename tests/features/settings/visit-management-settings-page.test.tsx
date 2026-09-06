import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { VisitManagementSettingsPage } from "@/features/settings/pages/VisitManagementSettingsPage";

const useUser = vi.fn();
const fetchOrganizationServices = vi.fn();

vi.mock("@/providers/user-provider", () => ({
  useUser: () => useUser(),
}));

vi.mock("@/providers/toast-provider", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

vi.mock("@/features/settings/services/settings.service", () => ({
  fetchOrganizationServices: (...args: unknown[]) =>
    fetchOrganizationServices(...args),
  createOrganizationService: vi.fn(),
  updateOrganizationService: vi.fn(),
}));

afterEach(() => {
  cleanup();
  useUser.mockReset();
  fetchOrganizationServices.mockReset();
});

describe("VisitManagementSettingsPage", () => {
  it("restricts the page for non-admins", () => {
    useUser.mockReturnValue({
      userData: { is_admin: false },
      isLoading: false,
    });

    render(<VisitManagementSettingsPage />);

    expect(screen.getByText("Access restricted")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Back to account settings" }),
    ).toBeInTheDocument();
  });

  it("lists consultation services as rows", async () => {
    useUser.mockReturnValue({
      userData: { is_admin: true },
      isLoading: false,
    });
    fetchOrganizationServices.mockResolvedValue({
      results: [
        {
          id: 1,
          uuid: "svc-1",
          name: "GP Consultation",
          code: "GP",
          description: "General practice visit",
          is_chargable: true,
          is_active: true,
          product: null,
          created_at: "2026-01-01T00:00:00Z",
        },
      ],
    });

    render(<VisitManagementSettingsPage />);

    await waitFor(() => {
      expect(screen.getByText("GP Consultation")).toBeInTheDocument();
    });
    expect(screen.getByText("General practice visit")).toBeInTheDocument();
    expect(screen.getByText("GP · Chargeable")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Update" })).toBeInTheDocument();
    expect(screen.queryByRole("columnheader")).not.toBeInTheDocument();
  });
});
