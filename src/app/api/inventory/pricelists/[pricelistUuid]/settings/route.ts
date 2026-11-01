import { PRICELISTS_API_PATHS } from "@/constants/pricelists-api";
import type { CatalogPricelistSettings } from "@/features/catalog/types/catalog.types";
import { handleInventoryDetailGet } from "@/lib/server/inventory-bff-handlers";

type RouteContext = { params: Promise<{ pricelistUuid: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { pricelistUuid } = await context.params;
  return handleInventoryDetailGet<CatalogPricelistSettings>(
    PRICELISTS_API_PATHS.settings(pricelistUuid),
    "user",
  );
}
