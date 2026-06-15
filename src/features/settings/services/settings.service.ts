import { BFF_SETTINGS_ROUTES } from "@/constants/api";
import type { User } from "@/features/auth/types/auth.types";
import type {
  CreateOrganizationLocationPayload,
  CreateOrganizationDepartmentPayload,
  CreateOrganizationPayerPayload,
  CreateOrganizationPayerSchemePayload,
  CreateOrganizationPricelistPayload,
  CreateOrganizationServicePayload,
  CreateTenantEmailConfigurationPayload,
  OrganizationDefaultPricelist,
  OrganizationClinic,
  OrganizationDepartment,
  OrganizationListResponse,
  OrganizationLocation,
  OrganizationPayer,
  OrganizationPayerScheme,
  OrganizationPricelist,
  OrganizationService,
  TenantBranding,
  TenantCurrency,
  TenantDetail,
  TenantEmailConfiguration,
  UpdateOrganizationClinicPayload,
  UpdateOrganizationContactPayload,
  UpdateOrganizationDepartmentPayload,
  UpdateOrganizationLocationPayload,
  UpdateOrganizationPricelistPayload,
  SetOrganizationDefaultPricelistPayload,
  UpdateOrganizationServicePayload,
  UpdateProfilePayload,
  UpdateTenantBrandingPayload,
  UpdateTenantCurrencyPayload,
  UpdateTenantEmailConfigurationPayload,
} from "@/features/settings/types/settings.types";
import { joinDisplayName } from "@/features/settings/utils/user-name";
import { bffRequest } from "@/lib/bff-client";

export async function updateProfile(
  payload: UpdateProfilePayload,
): Promise<User> {
  const data = await bffRequest<{ user: User }>(BFF_SETTINGS_ROUTES.updateProfile, {
    method: "PATCH",
    body: {
      firstName: payload.firstName.trim(),
      lastName: payload.lastName.trim(),
      name: joinDisplayName(payload.firstName, payload.lastName),
    },
  });

  return data.user;
}

export async function fetchOrganization(): Promise<TenantDetail> {
  const data = await bffRequest<{ tenant: TenantDetail }>(
    BFF_SETTINGS_ROUTES.organization,
  );

  return data.tenant;
}

export async function updateOrganizationContact(
  payload: UpdateOrganizationContactPayload,
): Promise<TenantDetail> {
  const data = await bffRequest<{ tenant: TenantDetail }>(
    BFF_SETTINGS_ROUTES.organization,
    {
      method: "PATCH",
      body: payload,
    },
  );

  return data.tenant;
}

export async function fetchOrganizationClinics(): Promise<
  OrganizationListResponse<OrganizationClinic>
> {
  return bffRequest<OrganizationListResponse<OrganizationClinic>>(
    `${BFF_SETTINGS_ROUTES.clinics}?page_size=100&ordering=name`,
  );
}

export async function updateOrganizationClinic(
  uuid: string,
  payload: UpdateOrganizationClinicPayload,
): Promise<OrganizationClinic> {
  return bffRequest<OrganizationClinic>(BFF_SETTINGS_ROUTES.clinicDetail(uuid), {
    method: "PATCH",
    body: payload,
  });
}

export async function fetchOrganizationLocations(): Promise<
  OrganizationListResponse<OrganizationLocation>
> {
  return bffRequest<OrganizationListResponse<OrganizationLocation>>(
    `${BFF_SETTINGS_ROUTES.locations}?page_size=100&ordering=name`,
  );
}

export async function createOrganizationLocation(
  payload: CreateOrganizationLocationPayload,
): Promise<OrganizationLocation> {
  return bffRequest<OrganizationLocation>(BFF_SETTINGS_ROUTES.locations, {
    method: "POST",
    body: payload,
  });
}

export async function updateOrganizationLocation(
  uuid: string,
  payload: UpdateOrganizationLocationPayload,
): Promise<OrganizationLocation> {
  return bffRequest<OrganizationLocation>(
    BFF_SETTINGS_ROUTES.locationDetail(uuid),
    {
      method: "PATCH",
      body: payload,
    },
  );
}

export type FetchOrganizationDepartmentsOptions = {
  clinicId?: number;
  pageSize?: number;
};

export async function fetchOrganizationDepartments(
  options: FetchOrganizationDepartmentsOptions = {},
): Promise<OrganizationListResponse<OrganizationDepartment>> {
  const pageSize = options.pageSize ?? 100;
  const results: OrganizationDepartment[] = [];
  let page = 1;
  let lastPagination: OrganizationListResponse<OrganizationDepartment>["pagination"] =
    null;

  while (true) {
    const params = new URLSearchParams({
      page: String(page),
      page_size: String(pageSize),
      ordering: options.clinicId ? "name" : "clinic__name,name",
    });

    if (options.clinicId) {
      params.set("clinic", String(options.clinicId));
    }

    const response = await bffRequest<
      OrganizationListResponse<OrganizationDepartment>
    >(`${BFF_SETTINGS_ROUTES.departments}?${params.toString()}`);

    results.push(...response.results);
    lastPagination = response.pagination;

    if (!response.pagination?.next) {
      break;
    }

    page += 1;
  }

  return {
    results,
    pagination: lastPagination
      ? {
          ...lastPagination,
          count: results.length,
          next: null,
          previous: null,
        }
      : null,
  };
}

export async function createOrganizationDepartment(
  payload: CreateOrganizationDepartmentPayload,
): Promise<OrganizationDepartment> {
  return bffRequest<OrganizationDepartment>(BFF_SETTINGS_ROUTES.departments, {
    method: "POST",
    body: payload,
  });
}

export async function updateOrganizationDepartment(
  uuid: string,
  payload: UpdateOrganizationDepartmentPayload,
): Promise<OrganizationDepartment> {
  return bffRequest<OrganizationDepartment>(
    BFF_SETTINGS_ROUTES.departmentDetail(uuid),
    {
      method: "PATCH",
      body: payload,
    },
  );
}

export async function fetchOrganizationServices(): Promise<
  OrganizationListResponse<OrganizationService>
> {
  return bffRequest<OrganizationListResponse<OrganizationService>>(
    `${BFF_SETTINGS_ROUTES.visitTypes}?page_size=100&ordering=name`,
  );
}

export async function createOrganizationService(
  payload: CreateOrganizationServicePayload,
): Promise<OrganizationService> {
  return bffRequest<OrganizationService>(BFF_SETTINGS_ROUTES.visitTypes, {
    method: "POST",
    body: payload,
  });
}

export async function updateOrganizationService(
  uuid: string,
  payload: UpdateOrganizationServicePayload,
): Promise<OrganizationService> {
  return bffRequest<OrganizationService>(
    BFF_SETTINGS_ROUTES.visitTypeDetail(uuid),
    {
      method: "PATCH",
      body: payload,
    },
  );
}

export async function fetchOrganizationPayers(): Promise<
  OrganizationListResponse<OrganizationPayer>
> {
  return bffRequest<OrganizationListResponse<OrganizationPayer>>(
    `${BFF_SETTINGS_ROUTES.insuranceCompanies}?page_size=100&ordering=name`,
  );
}

export async function createOrganizationPayer(
  payload: CreateOrganizationPayerPayload,
): Promise<OrganizationPayer> {
  return bffRequest<OrganizationPayer>(BFF_SETTINGS_ROUTES.insuranceCompanies, {
    method: "POST",
    body: payload,
  });
}

export async function fetchOrganizationPayerSchemes(): Promise<
  OrganizationListResponse<OrganizationPayerScheme>
> {
  return bffRequest<OrganizationListResponse<OrganizationPayerScheme>>(
    `${BFF_SETTINGS_ROUTES.insuranceSchemes}?scope=organization&page_size=100&ordering=insurance_company__name,name`,
  );
}

export async function createOrganizationPayerScheme(
  payload: CreateOrganizationPayerSchemePayload,
): Promise<OrganizationPayerScheme> {
  return bffRequest<OrganizationPayerScheme>(BFF_SETTINGS_ROUTES.insuranceSchemes, {
    method: "POST",
    body: payload,
  });
}

export async function fetchOrganizationPricelists(): Promise<
  OrganizationListResponse<OrganizationPricelist>
> {
  return bffRequest<OrganizationListResponse<OrganizationPricelist>>(
    `${BFF_SETTINGS_ROUTES.pricelists}?include_inactive=true`,
  );
}

export async function createOrganizationPricelist(
  payload: CreateOrganizationPricelistPayload,
): Promise<OrganizationPricelist> {
  return bffRequest<OrganizationPricelist>(BFF_SETTINGS_ROUTES.pricelists, {
    method: "POST",
    body: payload,
  });
}

export async function updateOrganizationPricelist(
  id: number,
  payload: UpdateOrganizationPricelistPayload,
): Promise<OrganizationPricelist> {
  return bffRequest<OrganizationPricelist>(BFF_SETTINGS_ROUTES.pricelistDetail(id), {
    method: "PATCH",
    body: payload,
  });
}

export async function archiveOrganizationPricelist(id: number): Promise<void> {
  await bffRequest<void>(BFF_SETTINGS_ROUTES.pricelistDetail(id), {
    method: "DELETE",
  });
}

export async function fetchOrganizationDefaultPricelist(): Promise<OrganizationDefaultPricelist> {
  return bffRequest<OrganizationDefaultPricelist>(
    BFF_SETTINGS_ROUTES.pricelistDefault,
  );
}

export async function setOrganizationDefaultPricelist(
  payload: SetOrganizationDefaultPricelistPayload,
): Promise<OrganizationDefaultPricelist> {
  return bffRequest<OrganizationDefaultPricelist>(
    BFF_SETTINGS_ROUTES.pricelistDefault,
    {
      method: "POST",
      body: payload,
    },
  );
}

export async function fetchOrganizationBranding(): Promise<TenantBranding> {
  const data = await bffRequest<{ branding: TenantBranding }>(
    BFF_SETTINGS_ROUTES.branding,
  );

  return data.branding;
}

export async function updateOrganizationBranding(
  payload: UpdateTenantBrandingPayload,
): Promise<TenantBranding> {
  const data = await bffRequest<{ branding: TenantBranding }>(
    BFF_SETTINGS_ROUTES.branding,
    {
      method: "PATCH",
      body: payload,
    },
  );

  return data.branding;
}

export async function fetchOrganizationCurrency(): Promise<TenantCurrency> {
  const data = await bffRequest<{ currency: TenantCurrency }>(
    BFF_SETTINGS_ROUTES.currency,
  );

  return data.currency;
}

export async function updateOrganizationCurrency(
  payload: UpdateTenantCurrencyPayload,
): Promise<TenantCurrency> {
  const data = await bffRequest<{ currency: TenantCurrency }>(
    BFF_SETTINGS_ROUTES.currency,
    {
      method: "PATCH",
      body: payload,
    },
  );

  return data.currency;
}

export async function fetchTenantEmailConfiguration(): Promise<TenantEmailConfiguration | null> {
  const data = await bffRequest<{ configuration: TenantEmailConfiguration | null }>(
    BFF_SETTINGS_ROUTES.emailConfiguration,
  );

  return data.configuration;
}

export async function createTenantEmailConfiguration(
  payload: CreateTenantEmailConfigurationPayload,
): Promise<TenantEmailConfiguration> {
  const data = await bffRequest<{ configuration: TenantEmailConfiguration }>(
    BFF_SETTINGS_ROUTES.emailConfiguration,
    {
      method: "POST",
      body: payload,
    },
  );

  return data.configuration;
}

export async function updateTenantEmailConfiguration(
  id: number,
  payload: UpdateTenantEmailConfigurationPayload,
): Promise<TenantEmailConfiguration> {
  const data = await bffRequest<{ configuration: TenantEmailConfiguration }>(
    BFF_SETTINGS_ROUTES.emailConfigurationDetail(id),
    {
      method: "PATCH",
      body: payload,
    },
  );

  return data.configuration;
}
