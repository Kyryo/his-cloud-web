import { OCCUPATIONAL_HEALTH_API_PATHS } from "@/constants/occupational-health-api";
import { createLaboratoryCatalogListHandlers } from "@/lib/server/laboratory-catalog-bff";

/** @deprecated Prefer /library-section-items */
const handlers = createLaboratoryCatalogListHandlers(
  OCCUPATIONAL_HEALTH_API_PATHS.ohLibrarySectionItems,
  ["section", "include_inactive", "search", "page", "page_size"],
);

export const GET = handlers.GET;
export const POST = handlers.POST;
