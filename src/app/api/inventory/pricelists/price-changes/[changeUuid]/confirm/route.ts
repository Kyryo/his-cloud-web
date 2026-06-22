import { PRICELISTS_API_PATHS } from "@/constants/pricelists-api";
import { handleInventoryAction } from "@/lib/server/inventory-bff-handlers";

type RouteContext = { params: Promise<{ changeUuid: string }> };

export async function POST(_request: Request, context: RouteContext) {
  const { changeUuid } = await context.params;
  return handleInventoryAction(
    PRICELISTS_API_PATHS.confirmPriceChange(changeUuid),
    "admin",
  );
}
