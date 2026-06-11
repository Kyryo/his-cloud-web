import { INVENTORY_API_PATHS } from "@/constants/inventory-api";
import { handleInventorySearchGet } from "@/lib/server/inventory-bff-handlers";

const QUERY_KEYS = ["tenant", "q", "active"] as const;

export async function GET(request: Request) {
  return handleInventorySearchGet(
    request,
    INVENTORY_API_PATHS.products.search,
    QUERY_KEYS,
  );
}
