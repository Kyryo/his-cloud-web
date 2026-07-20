import { INVENTORY_API_PATHS } from "@/constants/inventory-api";
import {
  handleInventoryDetailGet,
  handleInventoryUpdate,
} from "@/lib/server/inventory-bff-handlers";

type RouteContext = {
  params: Promise<{ uuid: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { uuid } = await context.params;
  return handleInventoryDetailGet(
    INVENTORY_API_PATHS.dispensationConfigurations.detail(uuid),
    "admin",
  );
}

export async function PATCH(request: Request, context: RouteContext) {
  const { uuid } = await context.params;
  return handleInventoryUpdate(
    request,
    INVENTORY_API_PATHS.dispensationConfigurations.detail(uuid),
    "PATCH",
    "admin",
  );
}
