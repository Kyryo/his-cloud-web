import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ROUTES } from "@/constants/routes";
import { MasmEclaimsSettingsPage } from "@/features/settings/pages/MasmEclaimsSettingsPage";

const useUser = vi.fn();
const replace = vi.fn();
const searchParamsGet = vi.fn();
const fetchOrganizationClinics = vi.fn();
const fetchEClaimPractitionerMappings = vi.fn();
const fetchInsuranceSchemes = vi.fn();

vi.mock("@/providers/user-provider", () => ({
  useUser: () => useUser(),
}));

vi.mock("@/providers/toast-provider", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  useSearchParams: () => ({ get: searchParamsGet }),
}));

vi.mock("@/features/settings/services/settings.service", () => ({
  fetchOrganizationClinics: (...args: unknown[]) =>
    fetchOrganizationClinics(...args),
}));

vi.mock("@/features/claims/services/claims.service", () => ({
  fetchEClaimPractitionerMappings: (...args: unknown[]) =>
    fetchEClaimPractitionerMappings(...args),
}));

vi.mock("@/features/customers/services/insurance-schemes.service", () => ({
  fetchInsuranceSchemes: (...args: unknown[]) => fetchInsuranceSchemes(...args),
}));

afterEach(() => {
  cleanup();
  useUser.mockReset();
  replace.mockReset();
  searchParamsGet.mockReset();
  fetchOrganizationClinics.mockReset();
  fetchEClaimPractitionerMappings.mockReset();
  fetchInsuranceSchemes.mockReset();
});

const clinic = {
  id: 10,
  uuid: "clinic-10",
  name: "Main Clinic",
  code: "MAIN",
  status: "ACTIVE",
  is_active: true,
  location_count: 2,
  operating_hours_display: "08:00-17:00",
  created_at: "2026-01-01T00:00:00Z",
};

describe("MasmEclaimsSettingsPage", () => {
  it("restricts the page for non-admins", () => {
    useUser.mockReturnValue({
      userData: { is_admin: false },
      isLoading: false,
    });
    searchParamsGet.mockReturnValue(null);

    render(<MasmEclaimsSettingsPage />);

    expect(screen.getByText("Access restricted")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Back to integrations" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Main Clinic")).not.toBeInTheDocument();
  });

  it("lists clinics as connection rows", async () => {
    useUser.mockReturnValue({
      userData: { is_admin: true },
      isLoading: false,
    });
    searchParamsGet.mockReturnValue(null);
    fetchOrganizationClinics.mockResolvedValue({ results: [clinic] });

    render(<MasmEclaimsSettingsPage />);

    await waitFor(() => {
      expect(screen.getByText("Main Clinic")).toBeInTheDocument();
    });
    expect(screen.getByText("MAIN · 2 locations · 08:00-17:00")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByTestId("masm-clinic-row-10")).toBeInTheDocument();
    expect(screen.queryByText("ACTIVE")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Practitioner mappings" }));
    expect(replace).toHaveBeenCalledWith(
      `${ROUTES.settingsIntegrationsMasemEclaims}?tab=practitioners`,
    );
  });

  it("lists practitioner mappings as clinic groups", async () => {
    useUser.mockReturnValue({
      userData: { is_admin: true },
      isLoading: false,
    });
    searchParamsGet.mockReturnValue("practitioners");
    fetchOrganizationClinics.mockResolvedValue({ results: [clinic] });
    fetchEClaimPractitionerMappings.mockResolvedValue({
      results: [
        {
          id: 1,
          uuid: "map-1",
          tenant: 1,
          clinic: 10,
          mapping_type: "scheme",
          insurance_scheme: 4,
          practitioner_number: "PRAC-22",
          service_provider_code: "PROV-9",
          is_active: true,
          created_at: "2026-01-01T00:00:00Z",
          updated_at: "2026-01-01T00:00:00Z",
        },
      ],
    });
    fetchInsuranceSchemes.mockResolvedValue([
      {
        id: 4,
        name: "MASM Corporate",
        insurance_company_name: "MASM",
      },
    ]);

    render(<MasmEclaimsSettingsPage />);

    await waitFor(() => {
      expect(screen.getByText("MASM Corporate · MASM")).toBeInTheDocument();
    });
    expect(screen.getByText("PRAC-22 · PROV-9")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add mapping" })).toBeInTheDocument();
    expect(screen.queryByRole("columnheader", { name: "Clinic" })).not.toBeInTheDocument();
  });
});
