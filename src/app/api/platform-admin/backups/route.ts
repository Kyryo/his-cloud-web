import { PLATFORM_ADMIN_API_PATHS } from "@/constants/platform-admin-api";
import type { PlatformAdminBackupJob } from "@/features/platform-admin/types/platform-admin.types";
import {
  platformAdminList,
  platformAdminWrite,
} from "@/lib/server/platform-admin-bff";

export async function GET(request: Request) {
  return platformAdminList<PlatformAdminBackupJob>(
    request,
    PLATFORM_ADMIN_API_PATHS.backups,
  );
}

export async function POST(request: Request) {
  return platformAdminWrite<PlatformAdminBackupJob>(
    request,
    PLATFORM_ADMIN_API_PATHS.backups,
    "POST",
    201,
  );
}
