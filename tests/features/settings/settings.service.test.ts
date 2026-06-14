import { describe, expect, it, vi } from "vitest";

import { BFF_SETTINGS_ROUTES } from "@/constants/api";
import {
  archiveOrganizationPricelist,
  createOrganizationLocation,
  createOrganizationDepartment,
  createOrganizationPayer,
  createOrganizationPayerScheme,
  createOrganizationPricelist,
  createOrganizationService,
  fetchOrganization,
  fetchOrganizationBranding,
  fetchOrganizationCurrency,
  fetchOrganizationClinics,
  fetchOrganizationDepartments,
  fetchOrganizationLocations,
  fetchOrganizationPayers,
  fetchOrganizationPayerSchemes,
  fetchOrganizationPricelists,
  fetchOrganizationDefaultPricelist,
  fetchOrganizationServices,
  fetchTenantEmailConfiguration,
  setOrganizationDefaultPricelist,
  createTenantEmailConfiguration,
  updateTenantEmailConfiguration,
  updateOrganizationBranding,
  updateOrganizationClinic,
  updateOrganizationDepartment,
  updateOrganizationContact,
  updateOrganizationCurrency,
  updateOrganizationLocation,
  updateOrganizationPricelist,
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

  it("fetches organization departments", async () => {
    vi.mocked(bffRequest).mockResolvedValueOnce({
      results: [{ uuid: "department-1", name: "OPD" }],
      pagination: null,
    });

    const response = await fetchOrganizationDepartments();

    expect(bffRequest).toHaveBeenCalledWith(
      `${BFF_SETTINGS_ROUTES.departments}?page_size=100&ordering=clinic__name,name`,
    );
    expect(response.results).toHaveLength(1);
  });

  it("creates an organization department", async () => {
    vi.mocked(bffRequest).mockResolvedValueOnce({
      uuid: "department-1",
      name: "OPD",
    });

    const department = await createOrganizationDepartment({
      name: "OPD",
      code: "OPD-01",
      clinic: 1,
      department_type: "opd",
    });

    expect(bffRequest).toHaveBeenCalledWith(BFF_SETTINGS_ROUTES.departments, {
      method: "POST",
      body: {
        name: "OPD",
        code: "OPD-01",
        clinic: 1,
        department_type: "opd",
      },
    });
    expect(department.name).toBe("OPD");
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

  it("fetches organization pricelists", async () => {
    vi.mocked(bffRequest).mockResolvedValueOnce({
      results: [{ id: 101, name: "Cash Pricelist", active: true }],
      pagination: null,
    });

    const response = await fetchOrganizationPricelists();

    expect(bffRequest).toHaveBeenCalledWith(
      `${BFF_SETTINGS_ROUTES.pricelists}?include_inactive=true`,
    );
    expect(response.results).toHaveLength(1);
  });

  it("creates an organization pricelist", async () => {
    vi.mocked(bffRequest).mockResolvedValueOnce({
      id: 101,
      name: "Cash Pricelist",
      active: true,
    });

    const pricelist = await createOrganizationPricelist({
      name: "Cash Pricelist",
      active: true,
    });

    expect(bffRequest).toHaveBeenCalledWith(BFF_SETTINGS_ROUTES.pricelists, {
      method: "POST",
      body: {
        name: "Cash Pricelist",
        active: true,
      },
    });
    expect(pricelist.name).toBe("Cash Pricelist");
  });

  it("fetches organization default pricelist", async () => {
    vi.mocked(bffRequest).mockResolvedValueOnce({
      tenant: 1,
      default_pricelist_id: 101,
    });

    const response = await fetchOrganizationDefaultPricelist();

    expect(bffRequest).toHaveBeenCalledWith(BFF_SETTINGS_ROUTES.pricelistDefault);
    expect(response.default_pricelist_id).toBe(101);
  });

  it("sets organization default pricelist", async () => {
    vi.mocked(bffRequest).mockResolvedValueOnce({
      tenant: 1,
      default_pricelist_id: 101,
    });

    const response = await setOrganizationDefaultPricelist({
      default_pricelist_id: 101,
    });

    expect(bffRequest).toHaveBeenCalledWith(BFF_SETTINGS_ROUTES.pricelistDefault, {
      method: "POST",
      body: {
        default_pricelist_id: 101,
      },
    });
    expect(response.default_pricelist_id).toBe(101);
  });

  it("clears organization default pricelist", async () => {
    vi.mocked(bffRequest).mockResolvedValueOnce({
      tenant: 1,
      default_pricelist_id: null,
    });

    const response = await setOrganizationDefaultPricelist({
      default_pricelist_id: null,
    });

    expect(bffRequest).toHaveBeenCalledWith(BFF_SETTINGS_ROUTES.pricelistDefault, {
      method: "POST",
      body: {
        default_pricelist_id: null,
      },
    });
    expect(response.default_pricelist_id).toBeNull();
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

  it("updates an organization department", async () => {
    vi.mocked(bffRequest).mockResolvedValueOnce({
      uuid: "department-1",
      name: "Dental",
    });

    const department = await updateOrganizationDepartment("department-1", {
      name: "Dental",
      code: "DENTAL-01",
      clinic: 1,
      department_type: "dental",
    });

    expect(bffRequest).toHaveBeenCalledWith(
      BFF_SETTINGS_ROUTES.departmentDetail("department-1"),
      {
        method: "PATCH",
        body: {
          name: "Dental",
          code: "DENTAL-01",
          clinic: 1,
          department_type: "dental",
        },
      },
    );
    expect(department.name).toBe("Dental");
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

  it("updates an organization pricelist", async () => {
    vi.mocked(bffRequest).mockResolvedValueOnce({
      id: 101,
      name: "Updated Cash",
      active: true,
    });

    const pricelist = await updateOrganizationPricelist(101, {
      name: "Updated Cash",
      active: true,
    });

    expect(bffRequest).toHaveBeenCalledWith(BFF_SETTINGS_ROUTES.pricelistDetail(101), {
      method: "PATCH",
      body: {
        name: "Updated Cash",
        active: true,
      },
    });
    expect(pricelist.name).toBe("Updated Cash");
  });

  it("archives an organization pricelist", async () => {
    vi.mocked(bffRequest).mockResolvedValueOnce(undefined);

    await archiveOrganizationPricelist(101);

    expect(bffRequest).toHaveBeenCalledWith(BFF_SETTINGS_ROUTES.pricelistDetail(101), {
      method: "DELETE",
    });
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

  it("fetches organization branding", async () => {
    vi.mocked(bffRequest).mockResolvedValueOnce({
      branding: {
        branding_logo_url: "https://example.com/logo.png",
        branding_primary_color: "#111111",
        branding_secondary_color: "#222222",
        branding_accent_color: "#333333",
      },
    });

    const branding = await fetchOrganizationBranding();

    expect(bffRequest).toHaveBeenCalledWith(BFF_SETTINGS_ROUTES.branding);
    expect(branding.branding_primary_color).toBe("#111111");
  });

  it("updates organization branding", async () => {
    vi.mocked(bffRequest).mockResolvedValueOnce({
      branding: {
        branding_logo_url: "",
        branding_primary_color: "#abcdef",
        branding_secondary_color: "",
        branding_accent_color: "",
      },
    });

    const branding = await updateOrganizationBranding({
      branding_primary_color: "#abcdef",
    });

    expect(bffRequest).toHaveBeenCalledWith(BFF_SETTINGS_ROUTES.branding, {
      method: "PATCH",
      body: { branding_primary_color: "#abcdef" },
    });
    expect(branding.branding_primary_color).toBe("#abcdef");
  });

  it("fetches organization currency", async () => {
    vi.mocked(bffRequest).mockResolvedValueOnce({
      currency: {
        company_id: 1,
        company_name: "Acme Health",
        currency: {
          id: 1,
          name: "KES",
          symbol: "KSh",
          full_name: "Kenyan Shilling",
          active: true,
        },
        available_currencies: [],
      },
    });

    const currency = await fetchOrganizationCurrency();

    expect(bffRequest).toHaveBeenCalledWith(BFF_SETTINGS_ROUTES.currency);
    expect(currency.currency.name).toBe("KES");
  });

  it("updates organization currency", async () => {
    vi.mocked(bffRequest).mockResolvedValueOnce({
      currency: {
        company_id: 1,
        company_name: "Acme Health",
        currency: {
          id: 2,
          name: "USD",
          symbol: "$",
          full_name: "US Dollar",
          active: true,
        },
        available_currencies: [],
      },
    });

    const currency = await updateOrganizationCurrency({ currency_id: 2 });

    expect(bffRequest).toHaveBeenCalledWith(BFF_SETTINGS_ROUTES.currency, {
      method: "PATCH",
      body: { currency_id: 2 },
    });
    expect(currency.currency.name).toBe("USD");
  });

  it("fetches tenant email configuration", async () => {
    vi.mocked(bffRequest).mockResolvedValueOnce({
      configuration: {
        id: 1,
        smtp_host: "smtp.example.com",
        has_smtp_password: true,
      },
    });

    const configuration = await fetchTenantEmailConfiguration();

    expect(bffRequest).toHaveBeenCalledWith(BFF_SETTINGS_ROUTES.emailConfiguration);
    expect(configuration?.smtp_host).toBe("smtp.example.com");
  });

  it("creates tenant email configuration", async () => {
    vi.mocked(bffRequest).mockResolvedValueOnce({
      configuration: { id: 2, smtp_host: "smtp.example.com" },
    });

    const configuration = await createTenantEmailConfiguration({
      smtp_host: "smtp.example.com",
      smtp_port: 587,
      smtp_username: "smtp-user",
      smtp_password: "secret",
      sender_name: "Acme Clinic",
      from_email: "no-reply@example.com",
    });

    expect(bffRequest).toHaveBeenCalledWith(BFF_SETTINGS_ROUTES.emailConfiguration, {
      method: "POST",
      body: {
        smtp_host: "smtp.example.com",
        smtp_port: 587,
        smtp_username: "smtp-user",
        smtp_password: "secret",
        sender_name: "Acme Clinic",
        from_email: "no-reply@example.com",
      },
    });
    expect(configuration.id).toBe(2);
  });

  it("updates tenant email configuration", async () => {
    vi.mocked(bffRequest).mockResolvedValueOnce({
      configuration: { id: 3, smtp_host: "mail.example.com" },
    });

    const configuration = await updateTenantEmailConfiguration(3, {
      smtp_host: "mail.example.com",
    });

    expect(bffRequest).toHaveBeenCalledWith(
      BFF_SETTINGS_ROUTES.emailConfigurationDetail(3),
      {
        method: "PATCH",
        body: { smtp_host: "mail.example.com" },
      },
    );
    expect(configuration.smtp_host).toBe("mail.example.com");
  });
});
