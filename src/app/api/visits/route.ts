import { VISITS_API_PATHS } from "@/constants/visits-api";
import type { CreateVisitPayload, CustomerVisit } from "@/features/customers/types/customer-visit.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { requireAccessToken } from "@/lib/server/require-access-token";

export async function POST(request: Request) {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }

    const body = (await request.json()) as CreateVisitPayload;

    if (!body.visit_type?.trim()) {
      return bffSuccess({ message: "Visit type is required." }, 400);
    }

    if (!body.customer?.trim()) {
      return bffSuccess({ message: "Customer is required." }, 400);
    }

    const visit = await hmisApiRequest<CustomerVisit>(VISITS_API_PATHS.list, {
      method: "POST",
      token: auth.accessToken,
      body: {
        visit_type: body.visit_type,
        customer: body.customer,
        visit_date: body.visit_date,
        mode_of_payment: body.mode_of_payment ?? "cash",
        insurance_scheme: body.insurance_scheme ?? null,
        requires_pre_authorization: body.requires_pre_authorization ?? false,
        pre_authorization_number: body.pre_authorization_number ?? "",
        pre_authorization_comments: body.pre_authorization_comments ?? "",
      },
    });

    return bffSuccess(visit, 201);
  } catch (error) {
    return bffError(error);
  }
}
