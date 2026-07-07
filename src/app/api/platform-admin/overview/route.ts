import { PLATFORM_ADMIN_API_PATHS } from "@/constants/platform-admin-api";
import type { PlatformAdminOverview } from "@/features/platform-admin/types/platform-admin.types";
import { platformAdminGet } from "@/lib/server/platform-admin-bff";

export async function GET() {
  return platformAdminGet<PlatformAdminOverview>(
    PLATFORM_ADMIN_API_PATHS.overview,
  );
}
