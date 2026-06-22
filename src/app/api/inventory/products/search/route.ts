import { INVENTORY_API_PATHS } from "@/constants/inventory-api";
import { handleInventoryListGet } from "@/lib/server/inventory-bff-handlers";

const QUERY_KEYS = ["tenant", "q", "active", "page", "page_size"] as const;

export async function GET(request: Request) {
  const url = new URL(request.url);
  if (!url.searchParams.has("page_size")) {
    url.searchParams.set("page_size", "200");
  }
  if (!url.searchParams.has("active") && url.searchParams.get("q")) {
    url.searchParams.set("active", "true");
  }

  return handleInventoryListGet(
    new Request(url.toString(), request),
    INVENTORY_API_PATHS.products.list,
    QUERY_KEYS,
    "user",
  );
}
