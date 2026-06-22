import { PRICELISTS_API_PATHS } from "@/constants/pricelists-api";
import {
  handleInventoryCreate,
  handleInventoryListGet,
} from "@/lib/server/inventory-bff-handlers";

const QUERY_KEYS = ["page", "page_size", "q", "include_inactive", "currency_code"] as const;

export async function GET(request: Request) {
  return handleInventoryListGet(
    request,
    PRICELISTS_API_PATHS.list,
    QUERY_KEYS,
    "admin",
  );
}

export async function POST(request: Request) {
  return handleInventoryCreate(request, PRICELISTS_API_PATHS.list, "admin");
}
