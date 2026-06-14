import { INVENTORY_API_PATHS } from "@/constants/inventory-api";
import {
  handleInventoryDelete,
  handleInventoryDetailGet,
  handleInventoryUpdate,
} from "@/lib/server/inventory-bff-handlers";

type RouteContext = {
  params: Promise<{ productId: string; schemeUuid: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { productId, schemeUuid } = await context.params;
  return handleInventoryDetailGet(
    INVENTORY_API_PATHS.products.tariffCodeDetail(productId, schemeUuid),
  );
}

export async function PATCH(request: Request, context: RouteContext) {
  const { productId, schemeUuid } = await context.params;
  return handleInventoryUpdate(
    request,
    INVENTORY_API_PATHS.products.tariffCodeDetail(productId, schemeUuid),
    "PATCH",
  );
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { productId, schemeUuid } = await context.params;
  return handleInventoryDelete(
    INVENTORY_API_PATHS.products.tariffCodeDetail(productId, schemeUuid),
  );
}
