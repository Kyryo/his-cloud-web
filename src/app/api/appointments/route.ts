import { APPOINTMENTS_API_PATHS } from "@/constants/appointments-api";
import {
  handleClinicalCreate,
  handleClinicalListGet,
} from "@/lib/server/clinical-bff-handlers";

const QUERY_KEYS = [
  "page",
  "page_size",
  "search",
  "ordering",
  "patient_uuid",
  "clinic_uuid",
  "department_uuid",
  "clinician_id",
  "status",
  "scheduled_from",
  "scheduled_to",
  "is_active",
] as const;

export async function GET(request: Request) {
  return handleClinicalListGet(
    request,
    APPOINTMENTS_API_PATHS.list,
    QUERY_KEYS,
    "user",
    { page_size: "20", ordering: "-scheduled_start" },
  );
}

export async function POST(request: Request) {
  return handleClinicalCreate(
    request,
    APPOINTMENTS_API_PATHS.list,
    "user",
    "appointment-create",
  );
}
