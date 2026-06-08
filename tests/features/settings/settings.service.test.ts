import { describe, expect, it, vi } from "vitest";

import { BFF_SETTINGS_ROUTES } from "@/constants/api";
import {
  createOrganizationLocation,
  createOrganizationPayer,
  createOrganizationPayerScheme,
  createOrganizationService,
  fetchOrganization,
  fetchOrganizationClinics,
  fetchOrganizationLocations,
  fetchOrganizationPayers,
  fetchOrganizationPayerSchemes,
  fetchOrganizationServices,
  updateOrganizationClinic,
  updateOrganizationContact,
  updateOrganizationLocation,
  updateOrganizationService,
} from "@/features/settings/services/settings.service";
import { bffRequest } from "@/lib/bff-client";

vi.mock("@/lib/bff-client", () => ({
  bffRequest: vi.fn(),
}));

describe("settings.service organization", () => {
  it("fetches organization details", async () => {
    vi.mocked(bffRequest).mockResolvedValueOnce({
      tenant: { uuid: "tenant-1", name: "Acme Health" },
    });

    const tenant = await fetchOrganization();

    expect(bffRequest).toHaveBeenCalledWith(BFF_SETTINGS_ROUTES.organization);
    expect(tenant.name).toBe("Acme Health");
  });

  it("updates organization contact details", async () => {
    vi.mocked(bffRequest).mockResolvedValueOnce({
      tenant: { uuid: "tenant-1", email: "info@acme.test" },
    });

    const tenant = await updateOrganizationContact({
      email: "info@acme.test",
      phone: "+254700000000",
    });

    expect(bffRequest).toHaveBeenCalledWith(BFF_SETTINGS_ROUTES.organization, {
      method: "PATCH",
      body: {
        email: "info@acme.test",
        phone: "+254700000000",
      },
    });
    expect(tenant.email).toBe("info@acme.test");
  });

  it("fetches organization clinics", async () => {
    vi.mocked(bffRequest).mockResolvedValueOnce({
      results: [{ uuid: "clinic-1", name: "Main Clinic" }],
      pagination: null,
    });

    const response = await fetchOrganizationClinics();

    expect(bffRequest).toHaveBeenCalledWith(
      `${BFF_SETTINGS_ROUTES.clinics}?page_size=100&ordering=name`,
    );
    expect(response.results).toHaveLength(1);
  });

  it("fetches organization locations", async () => {
    vi.mocked(bffRequest).mockResolvedValueOnce({
      results: [{ uuid: "location-1", name: "Front Desk" }],
      pagination: null,
    });

    const response = await fetchOrganizationLocations();

    expect(bffRequest).toHaveBeenCalledWith(
      `${BFF_SETTINGS_ROUTES.locations}?page_size=100&ordering=name`,
    );
    expect(response.results).toHaveLength(1);
  });

  it("creates an organization location", async () => {
    vi.mocked(bffRequest).mockResolvedValueOnce({
      uuid: "location-1",
      name: "Front Desk",
    });

    const location = await createOrganizationLocation({
      name: "Front Desk",
      code: "FD-01",
      clinic: 1,
    });

    expect(bffRequest).toHaveBeenCalledWith(BFF_SETTINGS_ROUTES.locations, {
      method: "POST",
      body: {
        name: "Front Desk",
        code: "FD-01",
        clinic: 1,
      },
    });
    expect(location.name).toBe("Front Desk");
  });

  it("fetches organization services", async () => {
    vi.mocked(bffRequest).mockResolvedValueOnce({
      results: [{ uuid: "service-1", name: "Consultation" }],
      pagination: null,
    });

    const response = await fetchOrganizationServices();

    expect(bffRequest).toHaveBeenCalledWith(
      `${BFF_SETTINGS_ROUTES.visitTypes}?page_size=100&ordering=name`,
    );
    expect(response.results).toHaveLength(1);
  });

  it("fetches organization payers", async () => {
    vi.mocked(bffRequest).mockResolvedValueOnce({
      results: [{ uuid: "payer-1", name: "MASM" }],
      pagination: null,
    });

    const response = await fetchOrganizationPayers();

    expect(bffRequest).toHaveBeenCalledWith(
      `${BFF_SETTINGS_ROUTES.insuranceCompanies}?page_size=100&ordering=name`,
    );
    expect(response.results).toHaveLength(1);
  });

  it("creates an organization service", async () => {
    vi.mocked(bffRequest).mockResolvedValueOnce({
      uuid: "service-1",
      name: "Consultation",
    });

    const service = await createOrganizationService({
      name: "Consultation",
    });

    expect(bffRequest).toHaveBeenCalledWith(BFF_SETTINGS_ROUTES.visitTypes, {
      method: "POST",
      body: { name: "Consultation" },
    });
    expect(service.name).toBe("Consultation");
  });

  it("creates an organization payer", async () => {
    vi.mocked(bffRequest).mockResolvedValueOnce({
      uuid: "payer-1",
      name: "MASM",
    });

    const payer = await createOrganizationPayer({
      name: "MASM",
      code: "MASM01",
    });

    expect(bffRequest).toHaveBeenCalledWith(BFF_SETTINGS_ROUTES.insuranceCompanies, {
      method: "POST",
      body: { name: "MASM", code: "MASM01" },
    });
    expect(payer.name).toBe("MASM");
  });

  it("fetches organization payer schemes", async () => {
    vi.mocked(bffRequest).mockResolvedValueOnce({
      results: [{ uuid: "scheme-1", name: "Premium Plan" }],
      pagination: null,
    });

    const response = await fetchOrganizationPayerSchemes();

    expect(bffRequest).toHaveBeenCalledWith(
      `${BFF_SETTINGS_ROUTES.insuranceSchemes}?scope=organization&page_size=100&ordering=insurance_company__name,name`,
    );
    expect(response.results).toHaveLength(1);
  });

  it("updates an organization clinic", async () => {
    vi.mocked(bffRequest).mockResolvedValueOnce({
      uuid: "clinic-1",
      name: "Renamed Clinic",
    });

    const clinic = await updateOrganizationClinic("clinic-1", {
      name: "Renamed Clinic",
    });

    expect(bffRequest).toHaveBeenCalledWith(
      BFF_SETTINGS_ROUTES.clinicDetail("clinic-1"),
      {
        method: "PATCH",
        body: { name: "Renamed Clinic" },
      },
    );
    expect(clinic.name).toBe("Renamed Clinic");
  });

  it("updates an organization location", async () => {
    vi.mocked(bffRequest).mockResolvedValueOnce({
      uuid: "location-1",
      name: "Updated Desk",
    });

    const location = await updateOrganizationLocation("location-1", {
      name: "Updated Desk",
      code: "FD-02",
      clinic: 1,
    });

    expect(bffRequest).toHaveBeenCalledWith(
      BFF_SETTINGS_ROUTES.locationDetail("location-1"),
      {
        method: "PATCH",
        body: {
          name: "Updated Desk",
          code: "FD-02",
          clinic: 1,
        },
      },
    );
    expect(location.name).toBe("Updated Desk");
  });

  it("updates an organization service", async () => {
    vi.mocked(bffRequest).mockResolvedValueOnce({
      uuid: "service-1",
      name: "Follow-up",
    });

    const service = await updateOrganizationService("service-1", {
      name: "Follow-up",
    });

    expect(bffRequest).toHaveBeenCalledWith(
      BFF_SETTINGS_ROUTES.visitTypeDetail("service-1"),
      {
        method: "PATCH",
        body: { name: "Follow-up" },
      },
    );
    expect(service.name).toBe("Follow-up");
  });

  it("creates an organization payer scheme", async () => {
    vi.mocked(bffRequest).mockResolvedValueOnce({
      uuid: "scheme-1",
      name: "Premium Plan",
    });

    const scheme = await createOrganizationPayerScheme({
      insurance_company: 1,
      name: "Premium Plan",
      code: "PP01",
      create_corresponding_pricelist: true,
      is_active: true,
    });

    expect(bffRequest).toHaveBeenCalledWith(BFF_SETTINGS_ROUTES.insuranceSchemes, {
      method: "POST",
      body: {
        insurance_company: 1,
        name: "Premium Plan",
        code: "PP01",
        create_corresponding_pricelist: true,
        is_active: true,
      },
    });
    expect(scheme.name).toBe("Premium Plan");
  });
});
