import { OCCUPATIONAL_HEALTH_API_PATHS } from "@/constants/occupational-health-api";
import { ohProxyPostHandler } from "@/lib/server/occupational-health-bff";

export async function POST(request: Request) {
  return ohProxyPostHandler(
    OCCUPATIONAL_HEALTH_API_PATHS.ohLibrarySectionItemsReorder,
    request,
    200,
  );
}
