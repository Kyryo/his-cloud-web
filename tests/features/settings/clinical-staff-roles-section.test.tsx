import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ClinicalStaffRolesSection } from "@/features/settings/components/ClinicalStaffRolesSection";

const fetchOrganizationUsers = vi.fn();
const updateOrganizationUser = vi.fn();
const toast = vi.fn();

vi.mock("@/features/settings/services/user-management.service", () => ({
  fetchOrganizationUsers: (...args: unknown[]) => fetchOrganizationUsers(...args),
  updateOrganizationUser: (...args: unknown[]) => updateOrganizationUser(...args),
}));

vi.mock("@/providers/toast-provider", () => ({
  useToast: () => ({ toast }),
}));

afterEach(() => {
  cleanup();
});

beforeEach(() => {
  fetchOrganizationUsers.mockReset();
  updateOrganizationUser.mockReset();
  toast.mockReset();
});

describe("ClinicalStaffRolesSection", () => {
  it("groups loaded staff by role", async () => {
    fetchOrganizationUsers.mockResolvedValue({
      results: [
        {
          id: 1,
          name: "Pia Mdala",
          email: "pia@example.com",
          is_admin: false,
          is_active: true,
          user_role: "physician",
          groups: ["Clinical"],
          primary_clinic: { id: 1, name: "Main Clinic", code: "MAIN" },
        },
        {
          id: 2,
          name: "Nia Banda",
          email: "nia@example.com",
          is_admin: false,
          is_active: true,
          user_role: "nurse",
          groups: ["Clinical"],
          primary_clinic: null,
        },
      ],
    });

    render(<ClinicalStaffRolesSection />);

    await waitFor(() => {
      expect(screen.getByText("Physicians")).toBeInTheDocument();
    });
    expect(screen.getByText("Nurses")).toBeInTheDocument();
    expect(screen.getByText("Pia Mdala")).toBeInTheDocument();
    expect(
      screen.getByRole("combobox", { name: "Clinical role for Pia Mdala" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Manage users" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Role access" })).not.toBeInTheDocument();
  });

  it("shows an empty state when no clinical staff exist", async () => {
    fetchOrganizationUsers.mockResolvedValue({ results: [] });

    render(<ClinicalStaffRolesSection />);

    await waitFor(() => {
      expect(screen.getByText(/No clinical staff yet/)).toBeInTheDocument();
    });
    expect(
      screen.queryByRole("link", { name: "Open user management" }),
    ).not.toBeInTheDocument();
  });
});
