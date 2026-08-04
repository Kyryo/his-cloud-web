import { PLATFORM_ADMIN_API_PATHS } from "@/constants/platform-admin-api";
import type { PlatformAdminWebhookJob } from "@/features/platform-admin/types/platform-admin.types";
import { platformAdminList } from "@/lib/server/platform-admin-bff";

type RouteContext = {
  params: Promise<{ tenantUuid: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { tenantUuid } = await context.params;
  return platformAdminList<PlatformAdminWebhookJob>(
    request,
    PLATFORM_ADMIN_API_PATHS.tenantWebhooks(tenantUuid),
  );
}
