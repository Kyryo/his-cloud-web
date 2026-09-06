import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { UserManagementSettingsPage } from "@/features/settings/pages/UserManagementSettingsPage";

const useUser = vi.fn();
const fetchOrganizationUsers = vi.fn();
const fetchOrganizationGroups = vi.fn();

vi.mock("@/providers/user-provider", () => ({
  useUser: () => useUser(),
}));

vi.mock("@/providers/toast-provider", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

vi.mock("@/features/settings/services/user-management.service", () => ({
  fetchOrganizationUsers: (...args: unknown[]) =>
    fetchOrganizationUsers(...args),
  fetchOrganizationGroups: (...args: unknown[]) =>
    fetchOrganizationGroups(...args),
  createOrganizationUser: vi.fn(),
  updateOrganizationUser: vi.fn(),
  createOrganizationGroup: vi.fn(),
  updateOrganizationGroup: vi.fn(),
}));

afterEach(() => {
  cleanup();
  useUser.mockReset();
  fetchOrganizationUsers.mockReset();
  fetchOrganizationGroups.mockReset();
});

describe("UserManagementSettingsPage", () => {
  it("restricts the page for non-admins", () => {
    useUser.mockReturnValue({
      userData: { is_admin: false },
      isLoading: false,
    });

    render(<UserManagementSettingsPage />);

    expect(screen.getByText("Access restricted")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Back to account settings" }),
    ).toBeInTheDocument();
  });

  it("lists users as rows and switches to groups", async () => {
    useUser.mockReturnValue({
      userData: { is_admin: true },
      isLoading: false,
    });
    fetchOrganizationUsers.mockResolvedValue({
      results: [
        {
          id: 8,
          name: "Ada Lovelace",
          email: "ada@example.com",
          is_admin: true,
          is_active: true,
          user_role: "physician",
          groups: ["Clinical", "Registration"],
          primary_clinic: { id: 1, name: "Main Clinic", code: "MAIN" },
        },
      ],
    });
    fetchOrganizationGroups.mockResolvedValue({
      results: [
        { id: 1, name: "Clinical" },
        { id: 2, name: "Custom Ops" },
      ],
    });

    render(<UserManagementSettingsPage />);

    await waitFor(() => {
      expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
    });
    expect(
      screen.getByText(
        "ada@example.com · Administrator · Physician · Clinical, Front Desk · Main Clinic",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByRole("columnheader")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Groups" }));

    await waitFor(() => {
      expect(screen.getByText("Custom Ops")).toBeInTheDocument();
    });
    expect(screen.getByText("Clinical")).toBeInTheDocument();
    expect(screen.getByText("Built-in module group")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Members" })).toHaveLength(2);
    expect(screen.getByRole("button", { name: "Update" })).toBeInTheDocument();
    expect(screen.queryByRole("columnheader")).not.toBeInTheDocument();
  });
});
