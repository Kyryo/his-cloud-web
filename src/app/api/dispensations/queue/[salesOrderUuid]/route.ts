import { INVENTORY_API_PATHS } from "@/constants/inventory-api";
import { handleInventoryDetailGet } from "@/lib/server/inventory-bff-handlers";

type RouteContext = {
  params: Promise<{ salesOrderUuid: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { salesOrderUuid } = await context.params;
  return handleInventoryDetailGet(
    INVENTORY_API_PATHS.dispensations.queue.detail(salesOrderUuid),
  );
}
