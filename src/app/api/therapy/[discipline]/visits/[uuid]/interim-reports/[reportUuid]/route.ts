import { THERAPY_API_PATHS } from "@/constants/therapy-api";
import type { TherapyInterimReport } from "@/features/therapy/types/therapy.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import {
  isServerTherapyDiscipline,
  requireTherapyAccess,
} from "@/lib/server/require-therapy-access";

type RouteContext = {
  params: Promise<{ discipline: string; uuid: string; reportUuid: string }>;
};

async function authorize(context: RouteContext) {
  const { discipline, uuid, reportUuid } = await context.params;
  if (!isServerTherapyDiscipline(discipline)) {
    return { error: bffSuccess({ message: "Invalid therapy discipline." }, 400) };
  }
  const auth = await requireTherapyAccess(discipline);
  if ("error" in auth) {
    return { error: bffSuccess({ message: auth.error }, auth.status) };
  }
  return { discipline, uuid, reportUuid, accessToken: auth.accessToken };
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const authorized = await authorize(context);
    if ("error" in authorized) return authorized.error;
    const body = (await request.json()) as { report?: string };
    const report = await hmisApiRequest<TherapyInterimReport>(
      THERAPY_API_PATHS.visitInterimReport(
        authorized.discipline,
        authorized.uuid,
        authorized.reportUuid,
      ),
      {
        method: "PUT",
        token: authorized.accessToken,
        body: { report: body.report ?? "" },
      },
    );
    return bffSuccess(report);
  } catch (error) {
    return bffError(error);
  }
}
