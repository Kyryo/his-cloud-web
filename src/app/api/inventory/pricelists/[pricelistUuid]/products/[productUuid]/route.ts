import { PRICELISTS_API_PATHS } from "@/constants/pricelists-api";
import {
  handleInventoryDelete,
  handleInventoryDetailGet,
  handleInventoryUpdate,
} from "@/lib/server/inventory-bff-handlers";

type RouteContext = {
  params: Promise<{ pricelistUuid: string; productUuid: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { pricelistUuid, productUuid } = await context.params;
  return handleInventoryDetailGet(
    PRICELISTS_API_PATHS.productDetail(pricelistUuid, productUuid),
    "admin",
  );
}

export async function PATCH(request: Request, context: RouteContext) {
  const { pricelistUuid, productUuid } = await context.params;
  return handleInventoryUpdate(
    request,
    PRICELISTS_API_PATHS.productDetail(pricelistUuid, productUuid),
    "PATCH",
    "admin",
  );
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { pricelistUuid, productUuid } = await context.params;
  return handleInventoryDelete(
    PRICELISTS_API_PATHS.productDetail(pricelistUuid, productUuid),
    "admin",
  );
}
