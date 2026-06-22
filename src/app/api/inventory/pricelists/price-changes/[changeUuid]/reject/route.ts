import { PRICELISTS_API_PATHS } from "@/constants/pricelists-api";
import { handleInventoryUpdate } from "@/lib/server/inventory-bff-handlers";

type RouteContext = { params: Promise<{ changeUuid: string }> };

export async function POST(request: Request, context: RouteContext) {
  const { changeUuid } = await context.params;
  return handleInventoryUpdate(
    request,
    PRICELISTS_API_PATHS.rejectPriceChange(changeUuid),
    "PATCH",
    "admin",
  );
}
