import { PLATFORM_ADMIN_API_PATHS } from "@/constants/platform-admin-api";
import type {
  PlatformAdminTenant,
  PlatformAdminTenantPayload,
} from "@/features/platform-admin/types/platform-admin.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { platformAdminWrite } from "@/lib/server/platform-admin-bff";
import { requirePlatformAdmin } from "@/lib/server/require-platform-admin";

type RouteContext = {
  params: Promise<{ tenantUuid: string }>;
};

const TENANT_DETAIL_TIMEOUT_MS = 60_000;

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { tenantUuid } = await context.params;
    const admin = await requirePlatformAdmin();
    if ("error" in admin) {
      return admin.error;
    }

    const data = await hmisApiRequest<PlatformAdminTenant>(
      PLATFORM_ADMIN_API_PATHS.tenantDetail(tenantUuid),
      { token: admin.accessToken, timeoutMs: TENANT_DETAIL_TIMEOUT_MS },
    );
    return bffSuccess(data);
  } catch (error) {
    return bffError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const { tenantUuid } = await context.params;
  return platformAdminWrite<PlatformAdminTenantPayload>(
    request,
    PLATFORM_ADMIN_API_PATHS.tenantDetail(tenantUuid),
    "PATCH",
  );
}
