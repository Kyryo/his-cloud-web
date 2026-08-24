import { INVENTORY_API_PATHS } from "@/constants/inventory-api";
import { handleInventoryCreate } from "@/lib/server/inventory-bff-handlers";

type RouteContext = { params: Promise<{ productId: string }> };

export async function POST(request: Request, context: RouteContext) {
  const { productId } = await context.params;
  return handleInventoryCreate(
    request,
    INVENTORY_API_PATHS.products.addAllPricelists(productId),
    "admin",
  );
}
