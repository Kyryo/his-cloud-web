import { CLINICAL_DIAGNOSIS_API_PATHS } from "@/constants/clinical-diagnosis-api";
import type { EncounterDiagnosis } from "@/features/clinical/types/clinical-diagnosis.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { requireAccessToken } from "@/lib/server/require-access-token";

type DiagnosisRouteContext = {
  params: Promise<{ diagnosisUuid: string }>;
};

export async function PATCH(request: Request, context: DiagnosisRouteContext) {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }

    const { diagnosisUuid } = await context.params;
    const body = await request.json();

    const diagnosis = await hmisApiRequest<EncounterDiagnosis>(
      CLINICAL_DIAGNOSIS_API_PATHS.diagnosisDetail(diagnosisUuid),
      {
        method: "PATCH",
        token: auth.accessToken,
        body,
      },
    );

    return bffSuccess({ diagnosis });
  } catch (error) {
    return bffError(error);
  }
}

export async function DELETE(_request: Request, context: DiagnosisRouteContext) {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }

    const { diagnosisUuid } = await context.params;

    await hmisApiRequest<void>(
      CLINICAL_DIAGNOSIS_API_PATHS.diagnosisDetail(diagnosisUuid),
      {
        method: "DELETE",
        token: auth.accessToken,
      },
    );

    return bffSuccess(null, 204);
  } catch (error) {
    return bffError(error);
  }
}
