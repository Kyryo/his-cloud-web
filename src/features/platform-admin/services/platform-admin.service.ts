import { BFF_PLATFORM_ADMIN_ROUTES } from "@/constants/api";
import { bffRequest } from "@/lib/bff-client";
import type {
  PlatformAdminAuditEvent,
  PlatformAdminClinic,
  PlatformAdminDashboard,
  PlatformAdminDepartment,
  PlatformAdminListResponse,
  PlatformAdminLocation,
  PlatformAdminTenant,
  PlatformAdminTenantConfiguration,
  PlatformAdminTenantPayload,
  PlatformAdminTenantStatus,
  PlatformAdminUser,
} from "@/features/platform-admin/types/platform-admin.types";

export type PlatformAdminListOptions = {
  page?: number;
  pageSize?: number;
  search?: string;
  ordering?: string;
  status?: string;
  isActive?: string;
};

function buildQuery(options: PlatformAdminListOptions = {}): string {
  const params = new URLSearchParams();
  if (options.page) params.set("page", String(options.page));
  if (options.pageSize) params.set("page_size", String(options.pageSize));
  if (options.search?.trim()) params.set("search", options.search.trim());
  if (options.ordering) params.set("ordering", options.ordering);
  if (options.status) params.set("status", options.status);
  if (options.isActive) params.set("is_active", options.isActive);
  const query = params.toString();
  return query ? `?${query}` : "";
}

export async function fetchPlatformAdminDashboard():
  Promise<PlatformAdminDashboard> {
  return bffRequest<PlatformAdminDashboard>(BFF_PLATFORM_ADMIN_ROUTES.dashboard);
}

export async function fetchPlatformAdminTenants(
  options: PlatformAdminListOptions = {},
): Promise<PlatformAdminListResponse<PlatformAdminTenant>> {
  return bffRequest<PlatformAdminListResponse<PlatformAdminTenant>>(
    `${BFF_PLATFORM_ADMIN_ROUTES.tenants}${buildQuery(options)}`,
  );
}

export async function createPlatformAdminTenant(
  payload: PlatformAdminTenantPayload,
): Promise<PlatformAdminTenant> {
  return bffRequest<PlatformAdminTenant>(BFF_PLATFORM_ADMIN_ROUTES.tenants, {
    method: "POST",
    body: payload,
  });
}

export async function fetchPlatformAdminTenant(
  tenantUuid: string,
): Promise<PlatformAdminTenant> {
  return bffRequest<PlatformAdminTenant>(
    BFF_PLATFORM_ADMIN_ROUTES.tenantDetail(tenantUuid),
  );
}

export async function updatePlatformAdminTenant(
  tenantUuid: string,
  payload: Partial<PlatformAdminTenantPayload>,
): Promise<PlatformAdminTenant> {
  return bffRequest<PlatformAdminTenant>(
    BFF_PLATFORM_ADMIN_ROUTES.tenantDetail(tenantUuid),
    {
      method: "PATCH",
      body: payload,
    },
  );
}

export async function updatePlatformAdminTenantStatus(
  tenantUuid: string,
  status: Exclude<PlatformAdminTenantStatus, "PENDING">,
): Promise<PlatformAdminTenant> {
  return bffRequest<PlatformAdminTenant>(
    BFF_PLATFORM_ADMIN_ROUTES.tenantStatus(tenantUuid),
    {
      method: "POST",
      body: { status },
    },
  );
}

export async function fetchPlatformAdminTenantClinics(
  tenantUuid: string,
): Promise<PlatformAdminListResponse<PlatformAdminClinic>> {
  return bffRequest<PlatformAdminListResponse<PlatformAdminClinic>>(
    `${BFF_PLATFORM_ADMIN_ROUTES.tenantClinics(tenantUuid)}?page_size=100`,
  );
}

export async function fetchPlatformAdminTenantDepartments(
  tenantUuid: string,
): Promise<PlatformAdminListResponse<PlatformAdminDepartment>> {
  return bffRequest<PlatformAdminListResponse<PlatformAdminDepartment>>(
    `${BFF_PLATFORM_ADMIN_ROUTES.tenantDepartments(tenantUuid)}?page_size=100`,
  );
}

export async function fetchPlatformAdminTenantLocations(
  tenantUuid: string,
): Promise<PlatformAdminListResponse<PlatformAdminLocation>> {
  return bffRequest<PlatformAdminListResponse<PlatformAdminLocation>>(
    `${BFF_PLATFORM_ADMIN_ROUTES.tenantLocations(tenantUuid)}?page_size=100`,
  );
}

export async function fetchPlatformAdminTenantUsers(
  tenantUuid: string,
): Promise<PlatformAdminListResponse<PlatformAdminUser>> {
  return bffRequest<PlatformAdminListResponse<PlatformAdminUser>>(
    `${BFF_PLATFORM_ADMIN_ROUTES.tenantUsers(tenantUuid)}?page_size=100`,
  );
}

export async function fetchPlatformAdminTenantConfiguration(
  tenantUuid: string,
): Promise<PlatformAdminTenantConfiguration> {
  return bffRequest<PlatformAdminTenantConfiguration>(
    BFF_PLATFORM_ADMIN_ROUTES.tenantConfiguration(tenantUuid),
  );
}

export async function fetchPlatformAdminTenantAuditEvents(
  tenantUuid: string,
): Promise<PlatformAdminListResponse<PlatformAdminAuditEvent>> {
  return bffRequest<PlatformAdminListResponse<PlatformAdminAuditEvent>>(
    `${BFF_PLATFORM_ADMIN_ROUTES.tenantAuditEvents(tenantUuid)}?page_size=100`,
  );
}
