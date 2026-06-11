import { INVENTORY_API_PATHS } from "@/constants/inventory-api";
import { handleInventoryDetailGet } from "@/lib/server/inventory-bff-handlers";

type RouteContext = { params: Promise<{ productId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { productId } = await context.params;
  return handleInventoryDetailGet(INVENTORY_API_PATHS.products.detail(productId));
}
