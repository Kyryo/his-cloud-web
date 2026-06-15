import { LOCATIONS_API_PATHS } from "@/constants/locations-api";
import type { ClinicalLocation } from "@/features/clinical/types/clinical-catalog.types";
import { handleClinicalListGet } from "@/lib/server/clinical-bff-handlers";

const QUERY_KEYS = [
  "page",
  "page_size",
  "search",
  "ordering",
  "clinic",
  "is_active",
] as const;

export async function GET(request: Request) {
  return handleClinicalListGet<ClinicalLocation>(
    request,
    LOCATIONS_API_PATHS.list,
    QUERY_KEYS,
    "user",
    { page_size: "100", is_active: "true", ordering: "name" },
  );
}
