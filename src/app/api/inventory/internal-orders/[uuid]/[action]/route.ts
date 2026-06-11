import { INVENTORY_API_PATHS } from "@/constants/inventory-api";
import { bffSuccess } from "@/lib/server/bff-response";
import { handleInventoryAction } from "@/lib/server/inventory-bff-handlers";

const VALID_ACTIONS = [
  "submit",
  "approve",
  "reject",
  "dispatch",
  "receive",
  "cancel",
] as const;

type RouteContext = {
  params: Promise<{ uuid: string; action: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  const { uuid, action } = await context.params;

  if (!VALID_ACTIONS.includes(action as (typeof VALID_ACTIONS)[number])) {
    return bffSuccess({ message: "Unknown action." }, 404);
  }

  return handleInventoryAction(
    INVENTORY_API_PATHS.internalOrders.action(uuid, action),
  );
}
