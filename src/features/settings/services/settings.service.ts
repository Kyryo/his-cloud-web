import { BFF_SETTINGS_ROUTES } from "@/constants/api";
import type { User } from "@/features/auth/types/auth.types";
import type {
  CreateOrganizationLocationPayload,
  CreateOrganizationPayerPayload,
  CreateOrganizationPayerSchemePayload,
  CreateOrganizationServicePayload,
  OrganizationClinic,
  OrganizationListResponse,
  OrganizationLocation,
  OrganizationPayer,
  OrganizationPayerScheme,
  OrganizationService,
  TenantDetail,
  UpdateOrganizationContactPayload,
  UpdateProfilePayload,
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
