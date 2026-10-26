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

export async function fetchPlatformAdminDashboard(): Promise<PlatformAdminDashboard> {
  return bffRequest<PlatformAdminDashboard>(
    BFF_PLATFORM_ADMIN_ROUTES.dashboard,
  );
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
    { timeoutMs: 60_000 },
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
  if (filters.sections?.length) {
    params.set("sections", filters.sections.join(","));
  }
  return `?${params.toString()}`;
}

export async function fetchPlatformAdminTenantUsage(
  tenantUuid: string,
  filters: PlatformAdminUsageFilters,
): Promise<PlatformAdminUsageResponse> {
  return bffRequest<PlatformAdminUsageResponse>(
    `${BFF_PLATFORM_ADMIN_ROUTES.tenantUsage(tenantUuid)}${buildUsageQuery(filters)}`,
    { timeoutMs: 90_000 },
  );
}

function buildWebhookQuery(
  options: PlatformAdminWebhookListOptions = {},
): string {
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

export async function fetchPlatformAdminOverview(): Promise<PlatformAdminOverview> {
  return bffRequest<PlatformAdminOverview>(BFF_PLATFORM_ADMIN_ROUTES.overview);
}

export async function listPlatformAdminTenantPayments(
  options: PlatformAdminListOptions = {},
): Promise<PlatformAdminListResponse<PlatformAdminTenantPayment>> {
  return bffRequest<PlatformAdminListResponse<PlatformAdminTenantPayment>>(
    `${BFF_PLATFORM_ADMIN_ROUTES.financeTenantPayments}${buildQuery(options)}`,
  );
}

export async function listPlatformAdminOperatingCosts(
  options: PlatformAdminListOptions = {},
): Promise<PlatformAdminListResponse<PlatformAdminOperatingCost>> {
  return bffRequest<PlatformAdminListResponse<PlatformAdminOperatingCost>>(
    `${BFF_PLATFORM_ADMIN_ROUTES.financeOperatingCosts}${buildQuery(options)}`,
  );
}

export async function listPlatformAdminCashSnapshots(
  options: PlatformAdminListOptions = {},
): Promise<PlatformAdminListResponse<PlatformAdminCashSnapshot>> {
  return bffRequest<PlatformAdminListResponse<PlatformAdminCashSnapshot>>(
    `${BFF_PLATFORM_ADMIN_ROUTES.financeCashSnapshots}${buildQuery(options)}`,
  );
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

export async function fetchPlatformAdminPayerRegistry(
  options: PlatformAdminListOptions & {
    countryCode?: string;
    needsReview?: string;
  } = {},
): Promise<
  PlatformAdminListResponse<
    import("@/features/settings/types/settings.types").CountryPayer
  >
> {
  const params = new URLSearchParams();
  if (options.page) params.set("page", String(options.page));
  if (options.pageSize) params.set("page_size", String(options.pageSize));
  if (options.search?.trim()) params.set("search", options.search.trim());
  if (options.ordering) params.set("ordering", options.ordering);
  if (options.status) params.set("status", options.status);
  if (options.countryCode) params.set("country_code", options.countryCode);
  if (options.needsReview) params.set("needs_review", options.needsReview);
  const query = params.toString();
  return bffRequest(
    `${BFF_PLATFORM_ADMIN_ROUTES.payerRegistry}${query ? `?${query}` : ""}`,
  );
}

export async function createPlatformAdminPayer(payload: {
  country_code: string;
  code: string;
  official_name: string;
  display_name?: string;
  integration_code?: string;
}): Promise<import("@/features/settings/types/settings.types").CountryPayer> {
  return bffRequest(BFF_PLATFORM_ADMIN_ROUTES.payerRegistry, {
    method: "POST",
    body: payload,
  });
}

export async function reviewPlatformAdminPayerRegistry(
  uuid: string,
  payload: { approve: boolean; review_note?: string },
): Promise<import("@/features/settings/types/settings.types").CountryPayer> {
  return bffRequest(BFF_PLATFORM_ADMIN_ROUTES.payerRegistryReview(uuid), {
    method: "POST",
    body: payload,
  });
}

export async function fetchPlatformAdminPayerSchemes(
  payerUuid: string,
): Promise<
  PlatformAdminListResponse<
    import("@/features/settings/types/settings.types").RegistryPayerScheme
  >
> {
  return bffRequest(
    `${BFF_PLATFORM_ADMIN_ROUTES.payerRegistrySchemes(payerUuid)}?page_size=100&ordering=name`,
  );
}

export async function createPlatformAdminPayerScheme(
  payerUuid: string,
  payload: { code: string; name: string; description?: string },
): Promise<
  import("@/features/settings/types/settings.types").RegistryPayerScheme
> {
  return bffRequest(BFF_PLATFORM_ADMIN_ROUTES.payerRegistrySchemes(payerUuid), {
    method: "POST",
    body: payload,
  });
}

export async function fetchPlatformAdminPayerPolicies(
  options: { page?: number; pageSize?: number } = {},
): Promise<
  PlatformAdminListResponse<
    import("@/features/settings/types/settings.types").CountryPayerPolicy
  >
> {
  const params = new URLSearchParams();
  params.set("page", String(options.page ?? 1));
  params.set("page_size", String(options.pageSize ?? 8));
  return bffRequest(`${BFF_PLATFORM_ADMIN_ROUTES.payerPolicies}?${params}`);
}

export async function fetchPlatformAdminPayerSchemeCatalog(
  options: { page?: number; pageSize?: number; search?: string } = {},
): Promise<
  PlatformAdminListResponse<
    import("@/features/settings/types/settings.types").RegistryPayerSchemeCatalogItem
  >
> {
  const params = new URLSearchParams();
  params.set("page", String(options.page ?? 1));
  params.set("page_size", String(options.pageSize ?? 8));
  if (options.search?.trim()) {
    params.set("search", options.search.trim());
  }
  return bffRequest(
    `${BFF_PLATFORM_ADMIN_ROUTES.payerRegistrySchemesCatalog}?${params}`,
  );
}

export async function updatePlatformAdminPayer(
  uuid: string,
  payload: {
    code?: string;
    official_name?: string;
    display_name?: string;
    integration_code?: string;
    capabilities?: string[];
    status?: string;
    is_active?: boolean;
  },
): Promise<import("@/features/settings/types/settings.types").CountryPayer> {
  return bffRequest(BFF_PLATFORM_ADMIN_ROUTES.payerRegistryDetail(uuid), {
    method: "PATCH",
    body: payload,
  });
}

export type MergePlatformAdminPayerResult = {
  payer: import("@/features/settings/types/settings.types").CountryPayer;
  source: import("@/features/settings/types/settings.types").CountryPayer;
  stats: {
    companies_moved: number;
    schemes_moved: number;
    schemes_collapsed: number;
    schemes_relinked: number;
  };
};

export async function mergePlatformAdminPayer(
  sourceUuid: string,
  payload: {
    target_uuid: string;
    code?: string;
    integration_code?: string;
    review_note?: string;
  },
): Promise<MergePlatformAdminPayerResult> {
  return bffRequest(BFF_PLATFORM_ADMIN_ROUTES.payerRegistryMerge(sourceUuid), {
    method: "POST",
    body: payload,
  });
}

export async function updatePlatformAdminPayerScheme(
  payerUuid: string,
  schemeUuid: string,
  payload: {
    code?: string;
    name?: string;
    description?: string;
    is_active?: boolean;
  },
): Promise<
  import("@/features/settings/types/settings.types").RegistryPayerScheme
> {
  return bffRequest(
    BFF_PLATFORM_ADMIN_ROUTES.payerRegistrySchemeDetail(payerUuid, schemeUuid),
    { method: "PATCH", body: payload },
  );
}

export async function deletePlatformAdminPayerScheme(
  payerUuid: string,
  schemeUuid: string,
): Promise<void> {
  await bffRequest(
    BFF_PLATFORM_ADMIN_ROUTES.payerRegistrySchemeDetail(payerUuid, schemeUuid),
    { method: "DELETE" },
  );
}

export async function updatePlatformAdminPayerPolicy(
  uuid: string,
  payload: { requires_admin_approval?: boolean; is_active?: boolean },
): Promise<
  import("@/features/settings/types/settings.types").CountryPayerPolicy
> {
  return bffRequest(BFF_PLATFORM_ADMIN_ROUTES.payerPolicyDetail(uuid), {
    method: "PATCH",
    body: payload,
  });
}

export async function createPlatformAdminPayerPolicy(payload: {
  country_code: string;
  requires_admin_approval: boolean;
}): Promise<
  import("@/features/settings/types/settings.types").CountryPayerPolicy
> {
  return bffRequest(BFF_PLATFORM_ADMIN_ROUTES.payerPolicies, {
    method: "POST",
    body: payload,
  });
}
