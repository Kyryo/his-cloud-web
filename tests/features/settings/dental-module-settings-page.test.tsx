import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DentalModuleSettingsPage } from "@/features/settings/pages/DentalModuleSettingsPage";

const useUser = vi.fn();
const useRoleCapabilities = vi.fn();
const mutateAsync = vi.fn();
const fetchOrganizationUsers = vi.fn();
const navigation = vi.hoisted(() => ({
  search: "",
}));

vi.mock("@/providers/user-provider", () => ({
  useUser: () => useUser(),
}));

vi.mock("@/features/clinical-opd/hooks/use-clinical-opd", () => ({
  useRoleCapabilities: () => useRoleCapabilities(),
  useUpdateRoleCapabilities: () => ({ mutateAsync }),
}));

vi.mock("@/features/settings/services/user-management.service", () => ({
  fetchOrganizationUsers: (...args: unknown[]) => fetchOrganizationUsers(...args),
  updateOrganizationUser: vi.fn(),
}));

vi.mock("@/providers/toast-provider", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/settings/modules/dental",
  useRouter: () => ({ replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(navigation.search),
}));

beforeEach(() => {
  navigation.search = "";
  useUser.mockReturnValue({
    userData: { is_admin: true },
    isLoading: false,
  });
  useRoleCapabilities.mockReturnValue({ data: [], isLoading: false });
  fetchOrganizationUsers.mockResolvedValue({ results: [] });
});

afterEach(() => {
  cleanup();
  useUser.mockReset();
  useRoleCapabilities.mockReset();
  mutateAsync.mockReset();
  fetchOrganizationUsers.mockReset();
});

describe("DentalModuleSettingsPage", () => {
  it("restricts the page for non-admins", () => {
    useUser.mockReturnValue({
      userData: { is_admin: false },
      isLoading: false,
    });

    render(<DentalModuleSettingsPage />);

    expect(screen.getByText("Access restricted")).toBeInTheDocument();
  });

  it("shows the dentists list by default", async () => {
    fetchOrganizationUsers.mockResolvedValue({
      results: [
        {
          id: 1,
          name: "Dr Molar",
          email: "molar@example.com",
          is_admin: false,
          is_active: true,
          user_role: "dentist",
          groups: ["Dental"],
          primary_clinic: null,
        },
      ],
    });

    render(<DentalModuleSettingsPage />);

    expect(screen.getByTestId("dental-module-settings")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Dentists" }),
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText("Dr Molar")).toBeInTheDocument();
    });
  });

  it("shows dentist-only role capabilities on the capabilities tab", () => {
    navigation.search = "tab=capabilities";
    useRoleCapabilities.mockReturnValue({
      data: [
        {
          uuid: "1",
          user_role: "dentist",
          capability: "perform_dental_procedure",
        },
      ],
      isLoading: false,
    });

    render(<DentalModuleSettingsPage />);

    expect(screen.getByText("Dental chart tab")).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Dentists" })).toBeInTheDocument();
    expect(
      screen.queryByRole("columnheader", { name: "Nurses" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("columnheader", { name: "Physicians" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("switch", {
        name: "Dentists: Perform dental procedures",
      }),
    ).toBeChecked();
  });
});
