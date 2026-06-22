import { PLATFORM_ADMIN_API_PATHS } from "@/constants/platform-admin-api";
import type { PlatformAdminTenant } from "@/features/platform-admin/types/platform-admin.types";
import {
  platformAdminList,
  platformAdminWrite,
} from "@/lib/server/platform-admin-bff";

export async function GET(request: Request) {
  return platformAdminList<PlatformAdminTenant>(
    request,
    PLATFORM_ADMIN_API_PATHS.tenants,
  );
}

export async function POST(request: Request) {
  return platformAdminWrite<PlatformAdminTenant>(
    request,
    PLATFORM_ADMIN_API_PATHS.tenants,
    "POST",
    201,
  );
}
