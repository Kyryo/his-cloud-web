import { LABORATORY_API_PATHS } from "@/constants/laboratory-api";
import type {
  AccessionOrderPayload,
  LabAccession,
} from "@/features/laboratory/types/laboratory.types";
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

    const { uuid } = await context.params;
    const body = (await request.json()) as AccessionOrderPayload;
    const accession = await hmisApiRequest<LabAccession>(
      LABORATORY_API_PATHS.accession(uuid),
      {
        method: "POST",
        token: auth.accessToken,
        body,
      },
    );

    return bffSuccess(accession, 201);
  } catch (error) {
    return bffError(error);
  }
}
