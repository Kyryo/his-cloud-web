import { VISITS_API_PATHS } from "@/constants/visits-api";
import { createVisitEncounterActionRoute } from "@/lib/server/visit-encounter-action-route";

export const POST = createVisitEncounterActionRoute("start");
