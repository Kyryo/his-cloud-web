import { VISITS_API_PATHS } from "@/constants/visits-api";
import type { TherapyVisit } from "@/features/therapy/types/therapy.types";
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
      VISITS_API_PATHS.detail(uuid),
      { token: auth.accessToken },
    );
    const belongsToDiscipline = visit.encounters.some(
      (encounter) => encounter.department_type === discipline,
    );

    if (!belongsToDiscipline) {
      return bffSuccess(
        { message: "Visit does not belong to this therapy discipline." },
        404,
      );
    }

    return bffSuccess(visit);
  } catch (error) {
    return bffError(error);
  }
}
