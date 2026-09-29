import { PLATFORM_ADMIN_API_PATHS } from "@/constants/platform-admin-api";
import type { CountryPayerPolicy } from "@/features/settings/types/settings.types";
import { platformAdminWrite } from "@/lib/server/platform-admin-bff";

type RouteContext = {
  params: Promise<{ uuid: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const { uuid } = await context.params;
  return platformAdminWrite<CountryPayerPolicy>(
    request,
    PLATFORM_ADMIN_API_PATHS.payerPolicyDetail(uuid),
    "PATCH",
  );
}
