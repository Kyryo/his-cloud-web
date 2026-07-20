import { INVENTORY_API_PATHS } from "@/constants/inventory-api";
import { handleInventoryListGet } from "@/lib/server/inventory-bff-handlers";

const QUERY_KEYS = ["page", "page_size", "clinic", "ordering"] as const;

export async function GET(request: Request) {
  return handleInventoryListGet(
    request,
    INVENTORY_API_PATHS.dispensationConfigurations.list,
    QUERY_KEYS,
    "admin",
  );
}
