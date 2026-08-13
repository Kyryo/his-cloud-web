import { BFF_PLATFORM_ADMIN_ROUTES } from "@/constants/api";
import { bffRequest } from "@/lib/bff-client";
import type {
  PlatformAdminAuditEvent,
  PlatformAdminBackupDownload,
  PlatformAdminBackupJob,
  PlatformAdminBackupListOptions,
  PlatformAdminBackupTarget,
  PlatformAdminCashSnapshot,
  PlatformAdminCashSnapshotPayload,
  PlatformAdminClinic,
  PlatformAdminDashboard,
  PlatformAdminDepartment,
  PlatformAdminListResponse,
  PlatformAdminLocation,
  PlatformAdminOperatingCost,
  PlatformAdminOperatingCostPayload,
  PlatformAdminOverview,
  PlatformAdminTenant,
  PlatformAdminTenantConfiguration,
  PlatformAdminTenantModulesPayload,
  PlatformAdminTenantModulesResponse,
  PlatformAdminTenantPayload,
  PlatformAdminTenantPayment,
  PlatformAdminTenantPaymentPayload,
  PlatformAdminTenantStatus,
  PlatformAdminUsageFilters,
  PlatformAdminUsageResponse,
  PlatformAdminUser,
  PlatformAdminWebhookJob,
  PlatformAdminWebhookJobDetail,
  PlatformAdminWebhookListOptions,
  PlatformAdminWebhookResendResult,
  UpdatePlatformAdminTenantConfigurationPayload,
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

export async function updatePlatformAdminTenantConfiguration(
  tenantUuid: string,
  payload: UpdatePlatformAdminTenantConfigurationPayload,
): Promise<PlatformAdminTenantConfiguration> {
  return bffRequest<PlatformAdminTenantConfiguration>(
    BFF_PLATFORM_ADMIN_ROUTES.tenantConfiguration(tenantUuid),
    {
      method: "PATCH",
      body: payload,
    },
  );
}

export async function fetchPlatformAdminTenantModules(
  tenantUuid: string,
): Promise<PlatformAdminTenantModulesResponse> {
  return bffRequest<PlatformAdminTenantModulesResponse>(
    BFF_PLATFORM_ADMIN_ROUTES.tenantModules(tenantUuid),
  );
}

export async function updatePlatformAdminTenantModules(
  tenantUuid: string,
  payload: PlatformAdminTenantModulesPayload,
): Promise<PlatformAdminTenantModulesResponse> {
  return bffRequest<PlatformAdminTenantModulesResponse>(
    BFF_PLATFORM_ADMIN_ROUTES.tenantModules(tenantUuid),
    {
      method: "PUT",
      body: payload,
    },
  );
}

export async function fetchPlatformAdminTenantAuditEvents(
  tenantUuid: string,
): Promise<PlatformAdminListResponse<PlatformAdminAuditEvent>> {
  return bffRequest<PlatformAdminListResponse<PlatformAdminAuditEvent>>(
    `${BFF_PLATFORM_ADMIN_ROUTES.tenantAuditEvents(tenantUuid)}?page_size=100`,
  );
}

function buildUsageQuery(filters: PlatformAdminUsageFilters): string {
  const params = new URLSearchParams();
  params.set("date_from", filters.dateFrom);
  params.set("date_to", filters.dateTo);
  if (filters.period) {
    params.set("period", filters.period);
  }
  return `?${params.toString()}`;
}

export async function fetchPlatformAdminTenantUsage(
  tenantUuid: string,
  filters: PlatformAdminUsageFilters,
): Promise<PlatformAdminUsageResponse> {
  return bffRequest<PlatformAdminUsageResponse>(
    `${BFF_PLATFORM_ADMIN_ROUTES.tenantUsage(tenantUuid)}${buildUsageQuery(filters)}`,
  );
}

function buildWebhookQuery(options: PlatformAdminWebhookListOptions = {}): string {
  const params = new URLSearchParams();
  if (options.page) params.set("page", String(options.page));
  if (options.pageSize) params.set("page_size", String(options.pageSize));
  if (options.deliveryStatus) {
    params.set("delivery_status", options.deliveryStatus);
  }
  if (options.status) params.set("status", options.status);
  if (options.type) params.set("type", options.type);
  const query = params.toString();
  return query ? `?${query}` : "";
}

export async function fetchPlatformAdminTenantWebhooks(
  tenantUuid: string,
  options: PlatformAdminWebhookListOptions = {},
): Promise<PlatformAdminListResponse<PlatformAdminWebhookJob>> {
  return bffRequest<PlatformAdminListResponse<PlatformAdminWebhookJob>>(
    `${BFF_PLATFORM_ADMIN_ROUTES.tenantWebhooks(tenantUuid)}${buildWebhookQuery(options)}`,
  );
}

export async function fetchPlatformAdminTenantWebhook(
  tenantUuid: string,
  jobId: number,
): Promise<PlatformAdminWebhookJobDetail> {
  return bffRequest<PlatformAdminWebhookJobDetail>(
    BFF_PLATFORM_ADMIN_ROUTES.tenantWebhookDetail(tenantUuid, jobId),
  );
}

export async function resendPlatformAdminTenantWebhook(
  tenantUuid: string,
  jobId: number,
): Promise<PlatformAdminWebhookResendResult> {
  return bffRequest<PlatformAdminWebhookResendResult>(
    BFF_PLATFORM_ADMIN_ROUTES.tenantWebhookResend(tenantUuid, jobId),
    { method: "POST", body: {} },
  );
}

export async function fetchPlatformAdminOverview():
  Promise<PlatformAdminOverview> {
  return bffRequest<PlatformAdminOverview>(BFF_PLATFORM_ADMIN_ROUTES.overview);
}

export async function createPlatformAdminTenantPayment(
  payload: PlatformAdminTenantPaymentPayload,
): Promise<PlatformAdminTenantPayment> {
  return bffRequest<PlatformAdminTenantPayment>(
    BFF_PLATFORM_ADMIN_ROUTES.financeTenantPayments,
    { method: "POST", body: payload },
  );
}

export async function createPlatformAdminOperatingCost(
  payload: PlatformAdminOperatingCostPayload,
): Promise<PlatformAdminOperatingCost> {
  return bffRequest<PlatformAdminOperatingCost>(
    BFF_PLATFORM_ADMIN_ROUTES.financeOperatingCosts,
    { method: "POST", body: payload },
  );
}

export async function createPlatformAdminCashSnapshot(
  payload: PlatformAdminCashSnapshotPayload,
): Promise<PlatformAdminCashSnapshot> {
  return bffRequest<PlatformAdminCashSnapshot>(
    BFF_PLATFORM_ADMIN_ROUTES.financeCashSnapshots,
    { method: "POST", body: payload },
  );
}

export async function listPlatformAdminBackupTargets(): Promise<
  PlatformAdminBackupTarget[]
> {
  return bffRequest<PlatformAdminBackupTarget[]>(
    BFF_PLATFORM_ADMIN_ROUTES.backupTargets,
  );
}

export async function listPlatformAdminBackups(
  options: PlatformAdminBackupListOptions,
): Promise<PlatformAdminListResponse<PlatformAdminBackupJob>> {
  const params = new URLSearchParams();
  params.set("target", options.target);
  if (options.page) {
    params.set("page", String(options.page));
  }
  if (options.pageSize) {
    params.set("page_size", String(options.pageSize));
  }
  if (options.status) {
    params.set("status", options.status);
  }
  return bffRequest<PlatformAdminListResponse<PlatformAdminBackupJob>>(
    `${BFF_PLATFORM_ADMIN_ROUTES.backups}?${params.toString()}`,
  );
}

export async function createPlatformAdminBackup(
  target: string,
): Promise<PlatformAdminBackupJob> {
  return bffRequest<PlatformAdminBackupJob>(BFF_PLATFORM_ADMIN_ROUTES.backups, {
    method: "POST",
    body: { target },
  });
}

export async function getPlatformAdminBackupDownload(
  backupUuid: string,
): Promise<PlatformAdminBackupDownload> {
  return bffRequest<PlatformAdminBackupDownload>(
    BFF_PLATFORM_ADMIN_ROUTES.backupDownload(backupUuid),
  );
}
