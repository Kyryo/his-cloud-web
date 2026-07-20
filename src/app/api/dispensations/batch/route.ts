import { INVENTORY_API_PATHS } from "@/constants/inventory-api";
import { handleInventoryCreate } from "@/lib/server/inventory-bff-handlers";

export async function POST(request: Request) {
  return handleInventoryCreate(request, INVENTORY_API_PATHS.dispensations.batch);
}
