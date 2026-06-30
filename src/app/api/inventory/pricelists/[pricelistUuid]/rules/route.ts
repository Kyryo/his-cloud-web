import { PRICELISTS_API_PATHS } from "@/constants/pricelists-api";
import {
  handleInventoryCreate,
  handleInventoryDetailGet,
} from "@/lib/server/inventory-bff-handlers";

type RouteContext = { params: Promise<{ pricelistUuid: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { pricelistUuid } = await context.params;
  return handleInventoryDetailGet(
    PRICELISTS_API_PATHS.rules(pricelistUuid),
    "admin",
  );
}

export async function POST(request: Request, context: RouteContext) {
  const { pricelistUuid } = await context.params;
  return handleInventoryCreate(
    request,
    PRICELISTS_API_PATHS.rules(pricelistUuid),
    "admin",
  );
}
