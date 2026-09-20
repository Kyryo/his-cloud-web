import { LABORATORY_API_PATHS } from "@/constants/laboratory-api";
import { createLaboratoryCatalogDetailHandlers } from "@/lib/server/laboratory-catalog-bff";

const handlers = createLaboratoryCatalogDetailHandlers(LABORATORY_API_PATHS.analyte);

export const GET = handlers.GET;
export const PATCH = handlers.PATCH;
export const DELETE = handlers.DELETE;
