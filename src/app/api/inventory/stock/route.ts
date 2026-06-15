import { INVENTORY_API_PATHS } from "@/constants/inventory-api";
import { handleInventoryListGet } from "@/lib/server/inventory-bff-handlers";

const QUERY_KEYS = [
  "page",
  "page_size",
  "search",
  "ordering",
  "tenant",
  "location_uuid",
  "clinic_uuid",
  "product_id",
  "batch_uuid",
  "is_active",
  "has_batch",
] as const;

export async function GET(request: Request) {
  return handleInventoryListGet(
    request,
    INVENTORY_API_PATHS.stock.list,
    QUERY_KEYS,
  );
}
