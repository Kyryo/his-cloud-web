import { THERAPY_API_PATHS } from "@/constants/therapy-api";
import type { TherapyTreatmentPlan } from "@/features/therapy/types/therapy.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import {
  isServerTherapyDiscipline,
  requireTherapyAccess,
} from "@/lib/server/require-therapy-access";

type RouteContext = {
  params: Promise<{ discipline: string; uuid: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  try {
    const { discipline, uuid } = await context.params;
    if (!isServerTherapyDiscipline(discipline)) {
      return bffSuccess({ message: "Invalid therapy discipline." }, 400);
    }
    const auth = await requireTherapyAccess(discipline);
    if ("error" in auth) {
      return bffSuccess({ message: auth.error }, auth.status);
    }
    const body = (await request.json()) as { discharge_summary: string };
    const plan = await hmisApiRequest<TherapyTreatmentPlan>(
      THERAPY_API_PATHS.visitTreatmentPlanDischarge(discipline, uuid),
      {
        method: "POST",
        token: auth.accessToken,
        body,
      },
    );
    return bffSuccess(plan);
  } catch (error) {
    return bffError(error);
  }
}
