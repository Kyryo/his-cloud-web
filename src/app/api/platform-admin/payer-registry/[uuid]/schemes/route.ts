import { PLATFORM_ADMIN_API_PATHS } from "@/constants/platform-admin-api";
import type { RegistryPayerScheme } from "@/features/settings/types/settings.types";
import {
  platformAdminList,
  platformAdminWrite,
} from "@/lib/server/platform-admin-bff";

type RouteContext = {
  params: Promise<{ uuid: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { uuid } = await context.params;
  return platformAdminList<RegistryPayerScheme>(
    request,
    PLATFORM_ADMIN_API_PATHS.payerRegistrySchemes(uuid),
  );
}

export async function POST(request: Request, context: RouteContext) {
  const { uuid } = await context.params;
  return platformAdminWrite<RegistryPayerScheme>(
    request,
    PLATFORM_ADMIN_API_PATHS.payerRegistrySchemes(uuid),
    "POST",
    201,
  );
}
