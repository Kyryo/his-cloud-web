import { PLATFORM_ADMIN_API_PATHS } from "@/constants/platform-admin-api";
import type { PlatformAdminTenant } from "@/features/platform-admin/types/platform-admin.types";
import { platformAdminWrite } from "@/lib/server/platform-admin-bff";

type RouteContext = {
  params: Promise<{ tenantUuid: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { tenantUuid } = await context.params;
  return platformAdminWrite<PlatformAdminTenant>(
    request,
    PLATFORM_ADMIN_API_PATHS.tenantStatus(tenantUuid),
    "POST",
  );
}
