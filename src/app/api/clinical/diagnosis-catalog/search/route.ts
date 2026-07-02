import { CLINICAL_DIAGNOSIS_API_PATHS } from "@/constants/clinical-diagnosis-api";
import type { DiagnosisCatalogItem } from "@/features/clinical/types/clinical-diagnosis.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { requireAccessToken } from "@/lib/server/require-access-token";

const FORWARDED_QUERY_KEYS = ["q", "standard"] as const;

function buildUpstreamQuery(request: Request): string {
  const incoming = new URL(request.url).searchParams;
  const params = new URLSearchParams();

  for (const key of FORWARDED_QUERY_KEYS) {
    const value = incoming.get(key);
    if (value) {
      params.set(key, value);
    }
  }

  const query = params.toString();
  return query ? `?${query}` : "";
}

export async function GET(request: Request) {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }

    const query = buildUpstreamQuery(request);
    const data = await hmisApiRequest<{ results: DiagnosisCatalogItem[] }>(
      `${CLINICAL_DIAGNOSIS_API_PATHS.diagnosisCatalogSearch}${query}`,
      { token: auth.accessToken },
    );

    return bffSuccess(data);
  } catch (error) {
    return bffError(error);
  }
}
