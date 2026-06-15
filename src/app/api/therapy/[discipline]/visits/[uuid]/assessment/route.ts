import { THERAPY_API_PATHS } from "@/constants/therapy-api";
import type { TherapyAssessment } from "@/features/therapy/types/therapy.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import {
  isServerTherapyDiscipline,
  requireTherapyAccess,
} from "@/lib/server/require-therapy-access";

type RouteContext = {
  params: Promise<{ discipline: string; uuid: string }>;
};

async function authorize(context: RouteContext) {
  const { discipline, uuid } = await context.params;
  if (!isServerTherapyDiscipline(discipline)) {
    return { error: bffSuccess({ message: "Invalid therapy discipline." }, 400) };
  }
  const auth = await requireTherapyAccess(discipline);
  if ("error" in auth) {
    return { error: bffSuccess({ message: auth.error }, auth.status) };
  }
  return { discipline, uuid, accessToken: auth.accessToken };
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const authorized = await authorize(context);
    if ("error" in authorized) return authorized.error;
    const assessment = await hmisApiRequest<Partial<TherapyAssessment>>(
      THERAPY_API_PATHS.visitAssessment(
        authorized.discipline,
        authorized.uuid,
      ),
      { token: authorized.accessToken },
    );
    return bffSuccess(assessment.uuid ? assessment : null);
  } catch (error) {
    return bffError(error);
  }
}

export async function POST(_request: Request, context: RouteContext) {
  try {
    const authorized = await authorize(context);
    if ("error" in authorized) return authorized.error;
    const assessment = await hmisApiRequest<TherapyAssessment>(
      THERAPY_API_PATHS.visitAssessment(
        authorized.discipline,
        authorized.uuid,
      ),
      {
        method: "POST",
        token: authorized.accessToken,
        body: {},
      },
    );
    return bffSuccess(assessment, 201);
  } catch (error) {
    return bffError(error);
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const authorized = await authorize(context);
    if ("error" in authorized) return authorized.error;
    const body = (await request.json()) as { assessment_notes: string };
    const assessment = await hmisApiRequest<TherapyAssessment>(
      THERAPY_API_PATHS.visitAssessment(
        authorized.discipline,
        authorized.uuid,
      ),
      {
        method: "PUT",
        token: authorized.accessToken,
        body,
      },
    );
    return bffSuccess(assessment);
  } catch (error) {
    return bffError(error);
  }
}
