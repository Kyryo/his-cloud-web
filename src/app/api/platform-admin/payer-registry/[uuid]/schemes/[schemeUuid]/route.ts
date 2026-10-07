import { PLATFORM_ADMIN_API_PATHS } from "@/constants/platform-admin-api";
import type { RegistryPayerScheme } from "@/features/settings/types/settings.types";
import {
  platformAdminDelete,
  platformAdminWrite,
} from "@/lib/server/platform-admin-bff";

type RouteContext = {
  params: Promise<{ uuid: string; schemeUuid: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const { uuid, schemeUuid } = await context.params;
  return platformAdminWrite<RegistryPayerScheme>(
    request,
    PLATFORM_ADMIN_API_PATHS.payerRegistrySchemeDetail(uuid, schemeUuid),
    "PATCH",
  );
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { uuid, schemeUuid } = await context.params;
  return platformAdminDelete(
    PLATFORM_ADMIN_API_PATHS.payerRegistrySchemeDetail(uuid, schemeUuid),
  );
}
