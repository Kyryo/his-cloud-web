import { PLATFORM_ADMIN_API_PATHS } from "@/constants/platform-admin-api";
import type { PlatformAdminUsageResponse } from "@/features/platform-admin/types/platform-admin.types";
import {
  buildPlatformAdminQuery,
} from "@/lib/server/platform-admin-bff";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { requirePlatformAdmin } from "@/lib/server/require-platform-admin";

type RouteContext = {
  params: Promise<{ tenantUuid: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  try {
    const { tenantUuid } = await context.params;
    const admin = await requirePlatformAdmin();
    if ("error" in admin) {
      return admin.error;
    }

    const query = buildPlatformAdminQuery(request);
    const data = await hmisApiRequest<PlatformAdminUsageResponse>(
      `${PLATFORM_ADMIN_API_PATHS.tenantUsage(tenantUuid)}${query}`,
      { token: admin.accessToken },
    );

    return bffSuccess(data);
  } catch (error) {
    return bffError(error);
  }
}
