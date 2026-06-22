import { PRICELISTS_API_PATHS } from "@/constants/pricelists-api";
import { handleInventoryListGet } from "@/lib/server/inventory-bff-handlers";

const QUERY_KEYS = ["page", "page_size", "status", "action"] as const;

export async function GET(request: Request) {
  return handleInventoryListGet(
    request,
    PRICELISTS_API_PATHS.priceChanges,
    QUERY_KEYS,
    "admin",
  );
}
