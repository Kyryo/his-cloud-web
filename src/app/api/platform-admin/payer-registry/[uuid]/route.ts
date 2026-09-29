import { PLATFORM_ADMIN_API_PATHS } from "@/constants/platform-admin-api";
import type { CountryPayer } from "@/features/settings/types/settings.types";
import { platformAdminWrite } from "@/lib/server/platform-admin-bff";

type RouteContext = {
  params: Promise<{ uuid: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const { uuid } = await context.params;
  return platformAdminWrite<CountryPayer>(
    request,
    PLATFORM_ADMIN_API_PATHS.payerRegistryDetail(uuid),
    "PATCH",
  );
}
