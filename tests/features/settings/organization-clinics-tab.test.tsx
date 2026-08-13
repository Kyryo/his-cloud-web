import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { OrganizationClinicsTab } from "@/features/settings/components/OrganizationClinicsTab";

const fetchOrganization = vi.fn();
const fetchOrganizationClinics = vi.fn();

vi.mock("@/features/settings/services/settings.service", () => ({
  fetchOrganization: (...args: unknown[]) => fetchOrganization(...args),
  fetchOrganizationClinics: (...args: unknown[]) =>
    fetchOrganizationClinics(...args),
  createOrganizationClinic: vi.fn(),
  updateOrganizationClinic: vi.fn(),
}));

vi.mock("@/providers/toast-provider", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

describe("OrganizationClinicsTab clinic limit", () => {
  beforeEach(() => {
    fetchOrganization.mockReset();
    fetchOrganizationClinics.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it("disables add clinic when the tenant is at its clinic limit", async () => {
    fetchOrganization.mockResolvedValue({
      uuid: "tenant-1",
      max_clinics: 1,
      clinic_count: 1,
    });
    fetchOrganizationClinics.mockResolvedValue({
      results: [
        {
          uuid: "clinic-1",
          name: "Main Clinic",
          code: "MAIN",
          status: "ACTIVE",
          is_active: true,
          location_count: 0,
          operating_hours_display: null,
          created_at: "2026-08-12T00:00:00Z",
        },
      ],
      pagination: null,
    });

    render(<OrganizationClinicsTab isActive />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Add clinic" })).toBeDisabled();
    });
    expect(
      screen.getByText("Clinic limit reached (1/1). Contact support to increase."),
    ).toBeInTheDocument();
  });

  it("enables add clinic when under the clinic limit", async () => {
    fetchOrganization.mockResolvedValue({
      uuid: "tenant-1",
      max_clinics: 2,
      clinic_count: 1,
    });
    fetchOrganizationClinics.mockResolvedValue({
      results: [
        {
          uuid: "clinic-1",
          name: "Main Clinic",
          code: "MAIN",
          status: "ACTIVE",
          is_active: true,
          location_count: 0,
          operating_hours_display: null,
          created_at: "2026-08-12T00:00:00Z",
        },
      ],
      pagination: null,
    });

    render(<OrganizationClinicsTab isActive />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Add clinic" })).toBeEnabled();
    });
    expect(screen.getByText("1/2 clinics used")).toBeInTheDocument();
  });
});
