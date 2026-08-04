import { PLATFORM_ADMIN_API_PATHS } from "@/constants/platform-admin-api";
import type { PlatformAdminWebhookJobDetail } from "@/features/platform-admin/types/platform-admin.types";
import { platformAdminGet } from "@/lib/server/platform-admin-bff";

type RouteContext = {
  params: Promise<{ tenantUuid: string; jobId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { tenantUuid, jobId } = await context.params;
  return platformAdminGet<PlatformAdminWebhookJobDetail>(
    PLATFORM_ADMIN_API_PATHS.tenantWebhookDetail(tenantUuid, jobId),
  );
}
