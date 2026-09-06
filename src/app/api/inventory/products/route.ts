import { INVENTORY_API_PATHS } from "@/constants/inventory-api";
import {
  handleInventoryCreate,
  handleInventoryListGet,
} from "@/lib/server/inventory-bff-handlers";

/** Allowlist of list filters forwarded to HMIS (incl. OPD order-tab classification flags). */
export const PRODUCT_LIST_QUERY_KEYS = [
  "page",
  "page_size",
  "q",
  "active",
  "product_type",
  "sale_ok",
  "purchase_ok",
  "default_code",
  "barcode",
  "is_lab_test",
  "is_radiology",
  "is_procedure",
  "is_sundry",
  "procedure_context",
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
