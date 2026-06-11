import { INVENTORY_API_PATHS } from "@/constants/inventory-api";
import {
  handleInventoryCreate,
  handleInventoryListGet,
} from "@/lib/server/inventory-bff-handlers";

const QUERY_KEYS = [
  "page",
  "page_size",
  "search",
  "ordering",
  "tenant",
  "odoo_product_id",
  "batch_number",
  "is_active",
] as const;

export async function GET(request: Request) {
  return handleInventoryListGet(
    request,
    INVENTORY_API_PATHS.batches.list,
    QUERY_KEYS,
  );
}

export async function POST(request: Request) {
  return handleInventoryCreate(request, INVENTORY_API_PATHS.batches.list);
}
