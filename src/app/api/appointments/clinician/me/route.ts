import { APPOINTMENTS_API_PATHS } from "@/constants/appointments-api";
import { handleClinicalListGet } from "@/lib/server/clinical-bff-handlers";

const QUERY_KEYS = [
  "page",
  "page_size",
  "search",
  "ordering",
  "status",
  "scheduled_from",
  "scheduled_to",
  "is_active",
] as const;

export async function GET(request: Request) {
  return handleClinicalListGet(
    request,
    APPOINTMENTS_API_PATHS.clinicianMe,
    QUERY_KEYS,
    "user",
    { page_size: "5", ordering: "scheduled_start", is_active: "true" },
  );
}
