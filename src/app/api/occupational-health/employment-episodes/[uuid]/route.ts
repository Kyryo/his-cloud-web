import { OCCUPATIONAL_HEALTH_API_PATHS } from "@/constants/occupational-health-api";
import { createLaboratoryCatalogDetailHandlers } from "@/lib/server/laboratory-catalog-bff";

const handlers = createLaboratoryCatalogDetailHandlers(
  OCCUPATIONAL_HEALTH_API_PATHS.employmentEpisode,
);

export const GET = handlers.GET;
export const PATCH = handlers.PATCH;
