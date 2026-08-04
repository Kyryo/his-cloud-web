import { PLATFORM_ADMIN_API_PATHS } from "@/constants/platform-admin-api";
import type { PlatformAdminWebhookResendResult } from "@/features/platform-admin/types/platform-admin.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { requirePlatformAdmin } from "@/lib/server/require-platform-admin";

type RouteContext = {
  params: Promise<{ tenantUuid: string; jobId: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  try {
    const admin = await requirePlatformAdmin();
    if ("error" in admin) {
      return admin.error;
    }

    const { tenantUuid, jobId } = await context.params;
    const data = await hmisApiRequest<PlatformAdminWebhookResendResult>(
      PLATFORM_ADMIN_API_PATHS.tenantWebhookResend(tenantUuid, jobId),
      {
        method: "POST",
        token: admin.accessToken,
        body: {},
      },
    );

    return bffSuccess(data);
  } catch (error) {
    return bffError(error);
  }
}
