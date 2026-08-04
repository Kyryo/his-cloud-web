import { CLAIMS_API_PATHS } from "@/constants/claims-api";
import type { MasmPayerIntegration } from "@/features/claims/types/claims.types";
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
    const integration = await hmisApiRequest<MasmPayerIntegration>(
      CLAIMS_API_PATHS.clinicPayerIntegration("masm", clinicId),
      { token: admin.accessToken },
    );

    return bffSuccess({ integration });
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

    const integration = await hmisApiRequest<MasmPayerIntegration>(
      CLAIMS_API_PATHS.clinicPayerIntegration("masm", clinicId),
      {
        method: "PATCH",
        token: admin.accessToken,
        body,
      },
    );

    return bffSuccess({ integration });
  } catch (error) {
    return bffError(error);
  }
}
