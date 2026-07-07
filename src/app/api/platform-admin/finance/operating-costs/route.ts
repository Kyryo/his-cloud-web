import { PLATFORM_ADMIN_API_PATHS } from "@/constants/platform-admin-api";
import type { PlatformAdminOperatingCost } from "@/features/platform-admin/types/platform-admin.types";
import {
  platformAdminList,
  platformAdminWrite,
} from "@/lib/server/platform-admin-bff";

export async function GET(request: Request) {
  return platformAdminList<PlatformAdminOperatingCost>(
    request,
    PLATFORM_ADMIN_API_PATHS.financeOperatingCosts,
  );
}

export async function POST(request: Request) {
  return platformAdminWrite<PlatformAdminOperatingCost>(
    request,
    PLATFORM_ADMIN_API_PATHS.financeOperatingCosts,
    "POST",
    201,
  );
}
