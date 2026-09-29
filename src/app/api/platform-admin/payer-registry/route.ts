import { PLATFORM_ADMIN_API_PATHS } from "@/constants/platform-admin-api";
import type { CountryPayer } from "@/features/settings/types/settings.types";
import {
  platformAdminList,
  platformAdminWrite,
} from "@/lib/server/platform-admin-bff";

export async function GET(request: Request) {
  return platformAdminList<CountryPayer>(
    request,
    PLATFORM_ADMIN_API_PATHS.payerRegistry,
  );
}

export async function POST(request: Request) {
  return platformAdminWrite<CountryPayer>(
    request,
    PLATFORM_ADMIN_API_PATHS.payerRegistry,
    "POST",
    201,
  );
}
