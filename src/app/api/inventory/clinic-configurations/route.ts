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
  "clinic",
  "batch_tracking_enabled",
  "is_active",
] as const;

export async function GET(request: Request) {
  return handleInventoryListGet(
    request,
    INVENTORY_API_PATHS.clinicConfigurations.list,
    QUERY_KEYS,
    "admin",
  );
}

export async function POST(request: Request) {
  return handleInventoryCreate(
    request,
    INVENTORY_API_PATHS.clinicConfigurations.list,
    "admin",
  );
}
