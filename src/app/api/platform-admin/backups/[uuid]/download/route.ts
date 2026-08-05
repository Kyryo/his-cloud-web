import { PLATFORM_ADMIN_API_PATHS } from "@/constants/platform-admin-api";
import type { PlatformAdminBackupDownload } from "@/features/platform-admin/types/platform-admin.types";
import { platformAdminGet } from "@/lib/server/platform-admin-bff";

type RouteContext = {
  params: Promise<{ uuid: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { uuid } = await context.params;
  return platformAdminGet<PlatformAdminBackupDownload>(
    PLATFORM_ADMIN_API_PATHS.backupDownload(uuid),
  );
}
