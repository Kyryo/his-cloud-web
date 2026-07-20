import { INVENTORY_API_PATHS } from "@/constants/inventory-api";
import {
  handleInventoryDetailGet,
  handleInventoryUpdate,
} from "@/lib/server/inventory-bff-handlers";

export async function GET() {
  return handleInventoryDetailGet(
    INVENTORY_API_PATHS.tenantConfiguration,
    "admin",
  );
}

export async function PATCH(request: Request) {
  return handleInventoryUpdate(
    request,
    INVENTORY_API_PATHS.tenantConfiguration,
    "PATCH",
    "admin",
  );
}
