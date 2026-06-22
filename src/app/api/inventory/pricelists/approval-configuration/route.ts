import { PRICELISTS_API_PATHS } from "@/constants/pricelists-api";
import {
  handleInventoryDetailGet,
  handleInventoryUpdate,
} from "@/lib/server/inventory-bff-handlers";

export async function GET() {
  return handleInventoryDetailGet(
    PRICELISTS_API_PATHS.approvalConfiguration,
    "admin",
  );
}

export async function PATCH(request: Request) {
  return handleInventoryUpdate(
    request,
    PRICELISTS_API_PATHS.approvalConfiguration,
    "PATCH",
    "admin",
  );
}
