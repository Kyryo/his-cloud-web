import { SCHEDULING_API_PATHS } from "@/constants/scheduling-api";
import { VISITS_API_PATHS } from "@/constants/visits-api";
import type {
  TherapyFutureAppointment,
  TherapyVisit,
} from "@/features/therapy/types/therapy.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import {
  isServerTherapyDiscipline,
  requireTherapyAccess,
} from "@/lib/server/require-therapy-access";

type RouteContext = {
  params: Promise<{ discipline: string; uuid: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { discipline, uuid } = await context.params;
    if (!isServerTherapyDiscipline(discipline)) {
      return bffSuccess({ message: "Invalid therapy discipline." }, 400);
    }
    const auth = await requireTherapyAccess(discipline);
    if ("error" in auth) {
      return bffSuccess({ message: auth.error }, auth.status);
    }

    const visit = await hmisApiRequest<TherapyVisit>(
      VISITS_API_PATHS.visitDetails(uuid),
      { token: auth.accessToken },
    );
    const today = new Date().toISOString().slice(0, 10);
    const params = new URLSearchParams({
      patient_uuid: visit.customer,
      scheduled_from: today,
      is_active: "true",
      page_size: "100",
    });
    const appointments = await hmisApiRequest<TherapyFutureAppointment[]>(
      `${SCHEDULING_API_PATHS.appointments}?${params.toString()}`,
      { token: auth.accessToken },
    );

    return bffSuccess({
      results: appointments.filter(
        (appointment) =>
          appointment.uuid !== visit.appointment &&
          !["cancelled", "no_show"].includes(appointment.status),
      ),
    });
  } catch (error) {
    return bffError(error);
  }
}
