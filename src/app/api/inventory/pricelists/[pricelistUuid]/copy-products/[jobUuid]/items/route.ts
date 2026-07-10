import { PRICELISTS_API_PATHS } from "@/constants/pricelists-api";
import { handleInventoryListGet } from "@/lib/server/inventory-bff-handlers";

type RouteContext = {
  params: Promise<{ pricelistUuid: string; jobUuid: string }>;
};

const QUERY_KEYS = ["page", "page_size", "status"] as const;

export async function GET(request: Request, context: RouteContext) {
  const { pricelistUuid, jobUuid } = await context.params;
  return handleInventoryListGet(
    request,
    PRICELISTS_API_PATHS.copyProductsJobItems(pricelistUuid, jobUuid),
    QUERY_KEYS,
    "admin",
  );
}
