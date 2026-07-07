import { PLATFORM_ADMIN_API_PATHS } from "@/constants/platform-admin-api";
import type { PlatformAdminTenantPayment } from "@/features/platform-admin/types/platform-admin.types";
import {
  platformAdminList,
  platformAdminWrite,
} from "@/lib/server/platform-admin-bff";

export async function GET(request: Request) {
  return platformAdminList<PlatformAdminTenantPayment>(
    request,
    PLATFORM_ADMIN_API_PATHS.financeTenantPayments,
  );
}

export async function POST(request: Request) {
  return platformAdminWrite<PlatformAdminTenantPayment>(
    request,
    PLATFORM_ADMIN_API_PATHS.financeTenantPayments,
    "POST",
    201,
  );
}
