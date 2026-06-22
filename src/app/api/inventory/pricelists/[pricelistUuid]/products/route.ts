import { PRICELISTS_API_PATHS } from "@/constants/pricelists-api";
import {
  handleInventoryCreate,
  handleInventoryListGet,
} from "@/lib/server/inventory-bff-handlers";

type RouteContext = { params: Promise<{ pricelistUuid: string }> };

const QUERY_KEYS = ["page", "page_size", "q"] as const;

export async function GET(request: Request, context: RouteContext) {
  const { pricelistUuid } = await context.params;
  return handleInventoryListGet(
    request,
    PRICELISTS_API_PATHS.products(pricelistUuid),
    QUERY_KEYS,
    "admin",
  );
}

export async function POST(request: Request, context: RouteContext) {
  const { pricelistUuid } = await context.params;
  return handleInventoryCreate(
    request,
    PRICELISTS_API_PATHS.products(pricelistUuid),
    "admin",
  );
}
