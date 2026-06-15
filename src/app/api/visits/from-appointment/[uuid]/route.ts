import { VISITS_API_PATHS } from "@/constants/visits-api";
import type { StartVisitFromAppointmentPayload, VisitDetail } from "@/features/visits/types/visit.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { requireAccessToken } from "@/lib/server/require-access-token";

type RouteContext = {
  params: Promise<{ uuid: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }

    const { uuid: appointmentUuid } = await context.params;
    const body = (await request.json().catch(() => ({}))) as StartVisitFromAppointmentPayload;

    const visit = await hmisApiRequest<VisitDetail>(
      VISITS_API_PATHS.fromAppointment(appointmentUuid),
      {
        method: "POST",
        token: auth.accessToken,
        body: {
          consultation_service: body.consultation_service ?? null,
          mode_of_payment: body.mode_of_payment ?? "cash",
          insurance_scheme: body.insurance_scheme ?? null,
        },
      },
    );

    return bffSuccess(visit, 201);
  } catch (error) {
    return bffError(error);
  }
}
