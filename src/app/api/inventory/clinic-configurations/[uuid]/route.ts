import { INVENTORY_API_PATHS } from "@/constants/inventory-api";
import {
  handleInventoryDelete,
  handleInventoryDetailGet,
  handleInventoryUpdate,
} from "@/lib/server/inventory-bff-handlers";

type RouteContext = { params: Promise<{ uuid: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { uuid } = await context.params;
  return handleInventoryDetailGet(
    INVENTORY_API_PATHS.clinicConfigurations.detail(uuid),
    "admin",
  );
}

export async function PATCH(request: Request, context: RouteContext) {
  const { uuid } = await context.params;
  return handleInventoryUpdate(
    request,
    INVENTORY_API_PATHS.clinicConfigurations.detail(uuid),
    "PATCH",
    "admin",
  );
}

export async function PUT(request: Request, context: RouteContext) {
  const { uuid } = await context.params;
  return handleInventoryUpdate(
    request,
    INVENTORY_API_PATHS.clinicConfigurations.detail(uuid),
    "PUT",
    "admin",
  );
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { uuid } = await context.params;
  return handleInventoryDelete(
    INVENTORY_API_PATHS.clinicConfigurations.detail(uuid),
    "admin",
  );
}
