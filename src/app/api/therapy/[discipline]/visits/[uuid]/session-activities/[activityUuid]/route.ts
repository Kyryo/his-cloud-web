import { THERAPY_API_PATHS } from "@/constants/therapy-api";
import type {
  TherapySessionActivity,
  TherapySessionActivityPayload,
} from "@/features/therapy/types/therapy.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import {
  isServerTherapyDiscipline,
  requireTherapyAccess,
} from "@/lib/server/require-therapy-access";

type RouteContext = {
  params: Promise<{
    discipline: string;
    uuid: string;
    activityUuid: string;
  }>;
};

async function authorize(context: RouteContext) {
  const { discipline, uuid, activityUuid } = await context.params;
  if (!isServerTherapyDiscipline(discipline)) {
    return { error: bffSuccess({ message: "Invalid therapy discipline." }, 400) };
  }
  const auth = await requireTherapyAccess(discipline);
  if ("error" in auth) {
    return { error: bffSuccess({ message: auth.error }, auth.status) };
  }
  return { discipline, uuid, activityUuid, accessToken: auth.accessToken };
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const authorized = await authorize(context);
    if ("error" in authorized) return authorized.error;
    const body = (await request.json()) as TherapySessionActivityPayload;
    const data = await hmisApiRequest<TherapySessionActivity>(
      THERAPY_API_PATHS.visitSessionActivity(
        authorized.discipline,
        authorized.uuid,
        authorized.activityUuid,
      ),
      { method: "PUT", token: authorized.accessToken, body },
    );
    return bffSuccess(data);
  } catch (error) {
    return bffError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const authorized = await authorize(context);
    if ("error" in authorized) return authorized.error;
    await hmisApiRequest<void>(
      THERAPY_API_PATHS.visitSessionActivity(
        authorized.discipline,
        authorized.uuid,
        authorized.activityUuid,
      ),
      { method: "DELETE", token: authorized.accessToken },
    );
    return new Response(null, { status: 204 });
  } catch (error) {
    return bffError(error);
  }
}
