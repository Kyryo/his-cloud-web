import { OCCUPATIONAL_HEALTH_API_PATHS } from "@/constants/occupational-health-api";
import { createLaboratoryCatalogListHandlers } from "@/lib/server/laboratory-catalog-bff";

const handlers = createLaboratoryCatalogListHandlers(
  OCCUPATIONAL_HEALTH_API_PATHS.ohImmunisations,
);

export const GET = handlers.GET;
export const POST = handlers.POST;
