import { PLATFORM_ADMIN_API_PATHS } from "@/constants/platform-admin-api";
import type { CountryPayer } from "@/features/settings/types/settings.types";
import { platformAdminWrite } from "@/lib/server/platform-admin-bff";

type RouteContext = {
  params: Promise<{ uuid: string }>;
};

type MergeResponse = {
  payer: CountryPayer;
  source: CountryPayer;
  stats: {
    companies_moved: number;
    schemes_moved: number;
    schemes_collapsed: number;
    schemes_relinked: number;
  };
};

export async function POST(request: Request, context: RouteContext) {
  const { uuid } = await context.params;
  return platformAdminWrite<MergeResponse>(
    request,
    PLATFORM_ADMIN_API_PATHS.payerRegistryMerge(uuid),
    "POST",
  );
}
