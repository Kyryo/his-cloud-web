import { INVENTORY_API_PATHS } from "@/constants/inventory-api";
import { handleInventoryListGet } from "@/lib/server/inventory-bff-handlers";

const QUERY_KEYS = [
  "page",
  "page_size",
  "search",
  "ordering",
  "tenant",
  "workflow",
  "document_type",
  "status",
] as const;

export async function GET(request: Request) {
  return handleInventoryListGet(
    request,
    INVENTORY_API_PATHS.approvalRecords.list,
    QUERY_KEYS,
    "admin",
  );
}
