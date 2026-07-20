import { INVENTORY_API_PATHS } from "@/constants/inventory-api";
import { handleInventoryDetailGet } from "@/lib/server/inventory-bff-handlers";

type RouteContext = {
  params: Promise<{ clinicId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { clinicId } = await context.params;
  return handleInventoryDetailGet(
    INVENTORY_API_PATHS.dispensationConfigurations.forClinic(Number(clinicId)),
  );
}
