import { PRICELISTS_API_PATHS } from "@/constants/pricelists-api";
import type { CatalogPricelistMasmCoreSyncJob } from "@/features/catalog/types/catalog.types";
import { handleInventoryDetailGet } from "@/lib/server/inventory-bff-handlers";

type RouteContext = {
  params: Promise<{ pricelistUuid: string; jobUuid: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { pricelistUuid, jobUuid } = await context.params;
  return handleInventoryDetailGet<CatalogPricelistMasmCoreSyncJob>(
    PRICELISTS_API_PATHS.syncMasmCorePricesJob(pricelistUuid, jobUuid),
    "user",
  );
}
