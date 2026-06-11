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
  "receiving_location",
  "status",
  "is_active",
] as const;

export async function GET(request: Request) {
  return handleInventoryListGet(
    request,
    INVENTORY_API_PATHS.purchaseOrders.list,
    QUERY_KEYS,
  );
}

export async function POST(request: Request) {
  return handleInventoryCreate(
    request,
    INVENTORY_API_PATHS.purchaseOrders.list,
  );
}
