import { PLATFORM_ADMIN_API_PATHS } from "@/constants/platform-admin-api";
import type { PlatformAdminBackupTarget } from "@/features/platform-admin/types/platform-admin.types";
import { platformAdminGet } from "@/lib/server/platform-admin-bff";

export async function GET() {
  return platformAdminGet<PlatformAdminBackupTarget[]>(
    PLATFORM_ADMIN_API_PATHS.backupTargets,
  );
}
