import { OCCUPATIONAL_HEALTH_API_PATHS } from "@/constants/occupational-health-api";
import { createLaboratoryCatalogDetailHandlers } from "@/lib/server/laboratory-catalog-bff";

/** @deprecated Prefer /library-sections/[uuid] */
const handlers = createLaboratoryCatalogDetailHandlers(
  OCCUPATIONAL_HEALTH_API_PATHS.ohLibrarySection,
);

export const GET = handlers.GET;
export const PATCH = handlers.PATCH;
export const DELETE = handlers.DELETE;
