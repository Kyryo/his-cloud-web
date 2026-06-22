import { PLATFORM_ADMIN_API_PATHS } from "@/constants/platform-admin-api";
import type { PlatformAdminTenantConfiguration } from "@/features/platform-admin/types/platform-admin.types";
import {
  platformAdminGet,
  platformAdminWrite,
} from "@/lib/server/platform-admin-bff";

type RouteContext = {
  params: Promise<{ tenantUuid: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { tenantUuid } = await context.params;
  return platformAdminGet<PlatformAdminTenantConfiguration>(
    PLATFORM_ADMIN_API_PATHS.tenantConfiguration(tenantUuid),
  );
}

export async function PATCH(request: Request, context: RouteContext) {
  const { tenantUuid } = await context.params;
  return platformAdminWrite<PlatformAdminTenantConfiguration>(
    request,
    PLATFORM_ADMIN_API_PATHS.tenantConfiguration(tenantUuid),
    "PATCH",
  );
}
