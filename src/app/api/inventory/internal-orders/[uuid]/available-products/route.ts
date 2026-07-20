import { INVENTORY_API_PATHS } from "@/constants/inventory-api";
import { handleInventorySearchGet } from "@/lib/server/inventory-bff-handlers";

type RouteContext = { params: Promise<{ uuid: string }> };

export async function GET(request: Request, context: RouteContext) {
  const { uuid } = await context.params;
  return handleInventorySearchGet(
    request,
    INVENTORY_API_PATHS.internalOrders.availableProducts(uuid),
    ["q"],
  );
}
