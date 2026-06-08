import { TENANTS_API_PATHS } from "@/constants/tenants-api";
import type {
  TenantBranding,
  UpdateTenantBrandingPayload,
} from "@/features/settings/types/settings.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { requireTenantAdmin } from "@/lib/server/require-tenant-admin";

const BRANDING_FIELDS = [
  "branding_logo_url",
  "branding_primary_color",
  "branding_secondary_color",
  "branding_accent_color",
] as const satisfies ReadonlyArray<keyof UpdateTenantBrandingPayload>;

function pickBrandingPayload(body: UpdateTenantBrandingPayload) {
  const payload: UpdateTenantBrandingPayload = {};

  for (const field of BRANDING_FIELDS) {
    if (field in body) {
      const value = body[field];
      payload[field] = typeof value === "string" ? value.trim() : value;
    }
  }

  return payload;
}

export async function GET() {
  try {
    const admin = await requireTenantAdmin();
    if ("error" in admin) {
      return admin.error;
    }

    const branding = await hmisApiRequest<TenantBranding>(
      TENANTS_API_PATHS.branding(admin.tenantUuid),
      { token: admin.accessToken },
    );

    return bffSuccess({ branding });
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

    const body = (await request.json()) as UpdateTenantBrandingPayload;
    const payload = pickBrandingPayload(body);

    if (Object.keys(payload).length === 0) {
      return bffSuccess({ message: "No valid fields to update." }, 400);
    }

    const branding = await hmisApiRequest<TenantBranding>(
      TENANTS_API_PATHS.branding(admin.tenantUuid),
      {
        method: "PATCH",
        token: admin.accessToken,
        body: payload,
      },
    );

    return bffSuccess({ branding });
  } catch (error) {
    return bffError(error);
  }
}
