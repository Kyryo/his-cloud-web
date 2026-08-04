import { CLAIMS_API_PATHS } from "@/constants/claims-api";
import type { MasmPortalCredential } from "@/features/claims/types/claims.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { requireTenantAdmin } from "@/lib/server/require-tenant-admin";

type RouteContext = {
  params: Promise<{ clinicId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const admin = await requireTenantAdmin();
    if ("error" in admin) {
      return admin.error;
    }

    const { clinicId } = await context.params;
    const credential = await hmisApiRequest<MasmPortalCredential>(
      CLAIMS_API_PATHS.clinicPortalCredentials("masm", clinicId),
      { token: admin.accessToken },
    );

    return bffSuccess({ credential });
  } catch (error) {
    return bffError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const admin = await requireTenantAdmin();
    if ("error" in admin) {
      return admin.error;
    }

    const { clinicId } = await context.params;
    const body = await request.json();

    const credential = await hmisApiRequest<MasmPortalCredential>(
      CLAIMS_API_PATHS.clinicPortalCredentials("masm", clinicId),
      {
        method: "PATCH",
        token: admin.accessToken,
        body,
      },
    );

    return bffSuccess({ credential });
  } catch (error) {
    return bffError(error);
  }
}
