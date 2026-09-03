import { CLINICAL_OPD_API_PATHS } from "@/constants/clinical-opd-api";
import { buildEncounterListHandlers } from "@/lib/server/clinical-opd-bff";

const handlers = buildEncounterListHandlers(
  CLINICAL_OPD_API_PATHS.encounterPrescriptions,
);

export const GET = handlers.GET;
export const POST = handlers.POST;
