import { OCCUPATIONAL_HEALTH_API_PATHS } from "@/constants/occupational-health-api";
import { createLaboratoryCatalogListHandlers } from "@/lib/server/laboratory-catalog-bff";

/** @deprecated Prefer /library-sections?kind=exam */
const handlers = createLaboratoryCatalogListHandlers(
  OCCUPATIONAL_HEALTH_API_PATHS.ohLibrarySections,
  ["include_inactive", "kind"],
);

export const GET = handlers.GET;
export const POST = handlers.POST;
