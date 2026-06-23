import { INVENTORY_API_PATHS } from "@/constants/inventory-api";
import { handleInventoryListGet } from "@/lib/server/inventory-bff-handlers";

const QUERY_KEYS = ["page", "page_size"] as const;

type RouteContext = { params: Promise<{ productId: string }> };

export async function GET(request: Request, context: RouteContext) {
  const { productId } = await context.params;
  return handleInventoryListGet(
    request,
    INVENTORY_API_PATHS.products.pricelists(productId),
    QUERY_KEYS,
    "user",
  );
}
