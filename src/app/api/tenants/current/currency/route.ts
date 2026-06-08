import { TENANTS_API_PATHS } from "@/constants/tenants-api";
import type {
  TenantCurrency,
  UpdateTenantCurrencyPayload,
} from "@/features/settings/types/settings.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { requireTenantAdmin } from "@/lib/server/require-tenant-admin";

export async function GET() {
  try {
    const admin = await requireTenantAdmin();
    if ("error" in admin) {
      return admin.error;
    }

    const currency = await hmisApiRequest<TenantCurrency>(
      TENANTS_API_PATHS.currency(admin.tenantUuid),
      { token: admin.accessToken },
    );

    return bffSuccess({ currency });
  } catch (error) {
    return bffError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const admin = await requireTenantAdmin();
    if ("error" in admin) {
      return admin.error;
    }

    const body = (await request.json()) as UpdateTenantCurrencyPayload;

    if (!body.currency_id || body.currency_id < 1) {
      return bffSuccess({ message: "A valid currency is required." }, 400);
    }

    const currency = await hmisApiRequest<TenantCurrency>(
      TENANTS_API_PATHS.currency(admin.tenantUuid),
      {
        method: "PATCH",
        token: admin.accessToken,
        body: { currency_id: body.currency_id },
      },
    );

    return bffSuccess({ currency });
  } catch (error) {
    return bffError(error);
  }
}
