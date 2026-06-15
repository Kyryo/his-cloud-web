import { VISITS_API_PATHS } from "@/constants/visits-api";
import type { CreateVisitPayload, VisitDetail } from "@/features/visits/types/visit.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { handleClinicalListGet } from "@/lib/server/clinical-bff-handlers";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { requireAccessToken } from "@/lib/server/require-access-token";

const QUERY_KEYS = [
  "page",
  "page_size",
  "search",
  "ordering",
  "customer_uuid",
  "clinic",
  "status",
  "is_active",
  "visit_date_after",
  "visit_date_before",
] as const;

export async function GET(request: Request) {
  return handleClinicalListGet<VisitDetail>(
    request,
    VISITS_API_PATHS.list,
    QUERY_KEYS,
    "user",
    { page_size: "20", ordering: "-visit_date" },
  );
}

export async function POST(request: Request) {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }

    const body = (await request.json()) as CreateVisitPayload;

    if (!body.customer?.trim()) {
      return bffSuccess({ message: "Customer is required." }, 400);
    }

    if (!body.department?.trim()) {
      return bffSuccess({ message: "Department is required." }, 400);
    }

    const visit = await hmisApiRequest<VisitDetail>(VISITS_API_PATHS.list, {
      method: "POST",
      token: auth.accessToken,
      body: {
        consultation_service: body.consultation_service ?? null,
        customer: body.customer,
        clinic: body.clinic ?? null,
        department: body.department,
        location: body.location ?? null,
        clinician: body.clinician ?? null,
        visit_date: body.visit_date,
        mode_of_payment: body.mode_of_payment ?? "cash",
        insurance_scheme: body.insurance_scheme ?? null,
        requires_pre_authorization: body.requires_pre_authorization ?? false,
        pre_authorization_number: body.pre_authorization_number ?? "",
        pre_authorization_comments: body.pre_authorization_comments ?? "",
        is_walk_in: body.is_walk_in ?? true,
      },
    });

    return bffSuccess(visit, 201);
  } catch (error) {
    return bffError(error);
  }
}
