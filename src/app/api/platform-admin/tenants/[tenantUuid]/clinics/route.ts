import { PLATFORM_ADMIN_API_PATHS } from "@/constants/platform-admin-api";
import type { PlatformAdminClinic } from "@/features/platform-admin/types/platform-admin.types";
import {
  platformAdminList,
  platformAdminWrite,
} from "@/lib/server/platform-admin-bff";

type RouteContext = {
  params: Promise<{ tenantUuid: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { tenantUuid } = await context.params;
  return platformAdminList<PlatformAdminClinic>(
    request,
    PLATFORM_ADMIN_API_PATHS.tenantClinics(tenantUuid),
  );
}

export async function POST(request: Request, context: RouteContext) {
  const { tenantUuid } = await context.params;
  return platformAdminWrite<PlatformAdminClinic>(
    request,
    PLATFORM_ADMIN_API_PATHS.tenantClinics(tenantUuid),
    "POST",
    201,
  );
}
