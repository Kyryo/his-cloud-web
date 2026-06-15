import { INVENTORY_API_PATHS } from "@/constants/inventory-api";
import type { PurchaseOrderAction } from "@/features/inventory/services/purchase-orders.service";
import { handleInventoryAction } from "@/lib/server/inventory-bff-handlers";

/** Static per-action route segments avoid Next.js `[action]` dynamic routing conflicts. */

type RouteContext = {
  params: Promise<{ uuid: string }>;
};

export function createPurchaseOrderActionRoute(action: PurchaseOrderAction) {
  return async function POST(_request: Request, context: RouteContext) {
    const { uuid } = await context.params;

    return handleInventoryAction(
      INVENTORY_API_PATHS.purchaseOrders.action(uuid, action),
    );
  };
}
