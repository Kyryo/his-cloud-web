import { CLINICS_API_PATHS } from "@/constants/clinics-api";
import type { ClinicalClinic } from "@/features/clinical/types/clinical-catalog.types";
import { handleClinicalListGet } from "@/lib/server/clinical-bff-handlers";

const QUERY_KEYS = ["page", "page_size", "search", "ordering", "is_active"] as const;

export async function GET(request: Request) {
  return handleClinicalListGet<ClinicalClinic>(
    request,
    CLINICS_API_PATHS.list,
    QUERY_KEYS,
    "user",
    { page_size: "100", is_active: "true", ordering: "name" },
  );
}
