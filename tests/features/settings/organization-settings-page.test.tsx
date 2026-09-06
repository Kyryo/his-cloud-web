import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { OrganizationSettingsPage } from "@/features/settings/pages/OrganizationSettingsPage";

const useUser = vi.fn();
const fetchOrganization = vi.fn();
const fetchOrganizationClinics = vi.fn();
const fetchOrganizationCurrency = vi.fn();

vi.mock("@/providers/user-provider", () => ({
  useUser: () => useUser(),
}));

vi.mock("@/providers/toast-provider", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

vi.mock("@/features/settings/services/settings.service", () => ({
  fetchOrganization: (...args: unknown[]) => fetchOrganization(...args),
  fetchOrganizationClinics: (...args: unknown[]) =>
    fetchOrganizationClinics(...args),
  fetchOrganizationCurrency: (...args: unknown[]) =>
    fetchOrganizationCurrency(...args),
  createOrganizationClinic: vi.fn(),
  updateOrganizationClinic: vi.fn(),
  updateOrganizationContact: vi.fn(),
}));

afterEach(() => {
  cleanup();
  useUser.mockReset();
  fetchOrganization.mockReset();
  fetchOrganizationClinics.mockReset();
  fetchOrganizationCurrency.mockReset();
});

const tenant = {
  id: 1,
  uuid: "tenant-1",
  name: "Sigma Clinic",
  code: "SIG",
  description: "Primary care",
  email: "ops@example.com",
  phone: null,
  address: null,
  city: null,
  state_province: null,
  country: "Malawi",
  postal_code: null,
  full_address: null,
  status: "ACTIVE",
  is_active: true,
  clinic_count: 1,
  max_clinics: 2,
  location_count: 3,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
  created_by_username: null,
  updated_by_username: null,
};

describe("OrganizationSettingsPage", () => {
  it("restricts the page for non-admins", () => {
    useUser.mockReturnValue({
      userData: { is_admin: false },
      isLoading: false,
    });

    render(<OrganizationSettingsPage />);

    expect(screen.getByText("Access restricted")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Back to account settings" }),
    ).toBeInTheDocument();
  });

  it("shows profile details and lists clinics as rows", async () => {
    useUser.mockReturnValue({
      userData: { is_admin: true },
      isLoading: false,
    });
    fetchOrganization.mockResolvedValue(tenant);
    fetchOrganizationCurrency.mockResolvedValue({ currency_code: "MWK" });
    fetchOrganizationClinics.mockResolvedValue({
      results: [
        {
          uuid: "clinic-1",
          name: "Main Clinic",
          code: "MAIN",
          status: "ACTIVE",
          is_active: true,
          location_count: 2,
          operating_hours_display: "08:00-17:00",
          created_at: "2026-01-01T00:00:00Z",
        },
      ],
    });

    render(<OrganizationSettingsPage />);

    await waitFor(() => {
      expect(screen.getByText("Sigma Clinic")).toBeInTheDocument();
    });
    expect(screen.getByText("SIG")).toBeInTheDocument();
    expect(screen.getByText("Malawi")).toBeInTheDocument();
    expect(screen.queryByRole("columnheader")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Clinics" }));

    await waitFor(() => {
      expect(screen.getByText("Main Clinic")).toBeInTheDocument();
    });
    expect(
      screen.getByText("MAIN · 2 locations · 08:00-17:00"),
    ).toBeInTheDocument();
    expect(screen.queryByRole("columnheader")).not.toBeInTheDocument();
  });
});
