import { INVENTORY_API_PATHS } from "@/constants/inventory-api";
import { handleInventoryListGet } from "@/lib/server/inventory-bff-handlers";

const QUERY_KEYS = [
  "page",
  "page_size",
  "search",
  "ordering",
  "tenant",
  "location",
  "odoo_product_id",
  "batch",
  "is_active",
] as const;

export async function GET(request: Request) {
  return handleInventoryListGet(
    request,
    INVENTORY_API_PATHS.stock.list,
    QUERY_KEYS,
  );
}
