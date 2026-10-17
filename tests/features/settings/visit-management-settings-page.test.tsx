import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { VisitManagementSettingsPage } from "@/features/settings/pages/VisitManagementSettingsPage";

const useUser = vi.fn();
const fetchOrganizationServices = vi.fn();
const navigation = vi.hoisted(() => ({
  query: "",
  replace: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: navigation.replace }),
  usePathname: () => "/settings/visit-management",
  useSearchParams: () => new URLSearchParams(navigation.query),
}));

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
  navigation.query = "";
  navigation.replace.mockReset();
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

  it("opens the add service dialog from the create link", async () => {
    navigation.query = "add=service";
    useUser.mockReturnValue({
      userData: { is_admin: true },
      isLoading: false,
    });
    fetchOrganizationServices.mockResolvedValue({ results: [] });

    render(<VisitManagementSettingsPage />);

    expect(
      await screen.findByRole("heading", { name: "Add consultation service" }),
    ).toBeInTheDocument();
    expect(navigation.replace).toHaveBeenCalledWith("/settings/visit-management", {
      scroll: false,
    });
  });
});
