import { PLATFORM_ADMIN_API_PATHS } from "@/constants/platform-admin-api";
import type { CountryPayerPolicy } from "@/features/settings/types/settings.types";
import {
  platformAdminList,
  platformAdminWrite,
} from "@/lib/server/platform-admin-bff";

export async function GET(request: Request) {
  return platformAdminList<CountryPayerPolicy>(
    request,
    PLATFORM_ADMIN_API_PATHS.payerPolicies,
  );
}

export async function POST(request: Request) {
  return platformAdminWrite<CountryPayerPolicy>(
    request,
    PLATFORM_ADMIN_API_PATHS.payerPolicies,
    "POST",
    201,
  );
}
