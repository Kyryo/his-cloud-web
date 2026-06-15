import { NextResponse } from "next/server";

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
    const currencyCode = body.currency_code?.trim().toUpperCase();

    if (!currencyCode || !/^[A-Z]{3}$/.test(currencyCode)) {
      return NextResponse.json(
        { message: "A valid three-letter currency code is required." },
        { status: 400 },
      );
    }

    const currency = await hmisApiRequest<TenantCurrency>(
      TENANTS_API_PATHS.currency(admin.tenantUuid),
      {
        method: "PATCH",
        token: admin.accessToken,
        body: { currency_code: currencyCode },
      },
    );

    return bffSuccess({ currency });
  } catch (error) {
    return bffError(error);
  }
}
