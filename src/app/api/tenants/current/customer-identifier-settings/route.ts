import { TENANTS_API_PATHS } from "@/constants/tenants-api";
import type {
  TenantCustomerIdentifierSettings,
  UpdateTenantCustomerIdentifierSettingsPayload,
} from "@/features/settings/types/settings.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { requireAccessToken } from "@/lib/server/require-access-token";
import { requireTenantAdmin } from "@/lib/server/require-tenant-admin";
import { resolveSession } from "@/lib/server/session";

const IDENTIFIER_STRING_FIELDS = [
  "customer_identifier_prefix",
  "customer_identifier_separator",
  "customer_identifier_suffix",
] as const satisfies ReadonlyArray<
  keyof UpdateTenantCustomerIdentifierSettingsPayload
>;

const IDENTIFIER_NUMBER_FIELDS = [
  "customer_identifier_digits",
  "customer_identifier_start_number",
] as const satisfies ReadonlyArray<
  keyof UpdateTenantCustomerIdentifierSettingsPayload
>;

async function requireTenantIdentifierViewer() {
  const session = await resolveSession();
  if (!session.authenticated || !session.user) {
    return { error: bffSuccess({ message: "Not authenticated." }, 401) };
  }

  const tenantUuid = session.user.tenant?.uuid;
  if (!tenantUuid) {
    return {
      error: bffSuccess(
        { message: "No organization is linked to this account." },
        404,
      ),
    };
  }

  const auth = await requireAccessToken();
  if ("error" in auth) {
    return {
      error: auth.error ?? bffSuccess({ message: "Not authenticated." }, 401),
    };
  }

  return {
    tenantUuid,
    accessToken: auth.accessToken,
  };
}

function pickIdentifierPayload(
  body: UpdateTenantCustomerIdentifierSettingsPayload,
): UpdateTenantCustomerIdentifierSettingsPayload {
  const payload: UpdateTenantCustomerIdentifierSettingsPayload = {};

  for (const field of IDENTIFIER_STRING_FIELDS) {
    const value = body[field];
    if (typeof value === "string") {
      payload[field] = value.trim();
    }
  }

  for (const field of IDENTIFIER_NUMBER_FIELDS) {
    const value = body[field];
    if (typeof value === "number") {
      payload[field] = value;
    }
  }

  return payload;
}

export async function GET() {
  try {
    const viewer = await requireTenantIdentifierViewer();
    if ("error" in viewer) {
      return viewer.error;
    }

    const settings = await hmisApiRequest<TenantCustomerIdentifierSettings>(
      TENANTS_API_PATHS.customerIdentifierSettings(viewer.tenantUuid),
      { token: viewer.accessToken },
    );

    return bffSuccess({ settings });
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

    const body =
      (await request.json()) as UpdateTenantCustomerIdentifierSettingsPayload;
    const payload = pickIdentifierPayload(body);

    if (Object.keys(payload).length === 0) {
      return bffSuccess({ message: "No valid fields to update." }, 400);
    }

    const settings = await hmisApiRequest<TenantCustomerIdentifierSettings>(
      TENANTS_API_PATHS.customerIdentifierSettings(admin.tenantUuid),
      {
        method: "PATCH",
        token: admin.accessToken,
        body: payload,
      },
    );

    return bffSuccess({ settings });
  } catch (error) {
    return bffError(error);
  }
}
