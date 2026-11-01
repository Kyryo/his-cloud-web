import { OCCUPATIONAL_HEALTH_API_PATHS } from "@/constants/occupational-health-api";
import { createLaboratoryCatalogListHandlers } from "@/lib/server/laboratory-catalog-bff";

const handlers = createLaboratoryCatalogListHandlers(
  OCCUPATIONAL_HEALTH_API_PATHS.ohCatalogItems,
  ["item_type", "section", "include_inactive", "search"],
);

export const GET = handlers.GET;
export const POST = handlers.POST;
