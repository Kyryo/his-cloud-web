import { CLINICAL_DIAGNOSIS_API_PATHS } from "@/constants/clinical-diagnosis-api";
import type { EncounterDiagnosis } from "@/features/clinical/types/clinical-diagnosis.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { requireAccessToken } from "@/lib/server/require-access-token";

type RouteContext = {
  params: Promise<{ visitUuid: string; encounterUuid: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }

    const { visitUuid, encounterUuid } = await context.params;
    const diagnoses = await hmisApiRequest<EncounterDiagnosis[]>(
      CLINICAL_DIAGNOSIS_API_PATHS.encounterDiagnoses(visitUuid, encounterUuid),
      { token: auth.accessToken },
    );

    return bffSuccess({ results: diagnoses });
  } catch (error) {
    return bffError(error);
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }

    const { visitUuid, encounterUuid } = await context.params;
    const body = await request.json();

    const diagnosis = await hmisApiRequest<EncounterDiagnosis>(
      CLINICAL_DIAGNOSIS_API_PATHS.encounterDiagnoses(visitUuid, encounterUuid),
      {
        method: "POST",
        token: auth.accessToken,
        body,
      },
    );

    return bffSuccess({ diagnosis }, 201);
  } catch (error) {
    return bffError(error);
  }
}
