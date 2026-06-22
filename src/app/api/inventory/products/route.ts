import { INVENTORY_API_PATHS } from "@/constants/inventory-api";
import {
  handleInventoryCreate,
  handleInventoryListGet,
} from "@/lib/server/inventory-bff-handlers";

const PRODUCT_LIST_QUERY_KEYS = [
  "page",
  "page_size",
  "q",
  "active",
  "product_type",
  "sale_ok",
  "purchase_ok",
  "default_code",
  "barcode",
] as const;

export async function GET(request: Request) {
  return handleInventoryListGet(
    request,
    INVENTORY_API_PATHS.products.list,
    PRODUCT_LIST_QUERY_KEYS,
    "user",
    { active: "true" },
  );
}

export async function POST(request: Request) {
  return handleInventoryCreate(request, INVENTORY_API_PATHS.products.list);
}
