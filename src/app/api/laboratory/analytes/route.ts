import { LABORATORY_API_PATHS } from "@/constants/laboratory-api";
import { createLaboratoryCatalogListHandlers } from "@/lib/server/laboratory-catalog-bff";

const handlers = createLaboratoryCatalogListHandlers(LABORATORY_API_PATHS.analytes);

export const GET = handlers.GET;
export const POST = handlers.POST;
