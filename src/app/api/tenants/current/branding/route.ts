import { HMIS_API_URL } from "@/constants/api";
import { TENANTS_API_PATHS } from "@/constants/tenants-api";
import type {
  TenantBranding,
  UpdateTenantBrandingPayload,
} from "@/features/settings/types/settings.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { requireAccessToken } from "@/lib/server/require-access-token";
import { requireTenantAdmin } from "@/lib/server/require-tenant-admin";
import { resolveSession } from "@/lib/server/session";

const BRANDING_FIELDS = [
  "branding_logo_url",
  "branding_primary_color",
  "branding_secondary_color",
  "branding_accent_color",
] as const satisfies ReadonlyArray<keyof UpdateTenantBrandingPayload>;

function mediaBaseUrl(): string {
  if (!HMIS_API_URL) {
    return "";
  }

  return HMIS_API_URL.replace(/\/api\/v\d+\/?$/, "");
}

function normalizeBrandingLogoUrl(branding: TenantBranding): TenantBranding {
  if (!branding.branding_logo_url.startsWith("/media/")) {
    return branding;
  }

  const baseUrl = mediaBaseUrl();
  if (!baseUrl) {
    return branding;
  }

  return {
    ...branding,
    branding_logo_url: `${baseUrl}${branding.branding_logo_url}`,
  };
}

async function requireTenantBrandingViewer() {
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
    const viewer = await requireTenantBrandingViewer();
    if ("error" in viewer) {
      return viewer.error;
    }

    const branding = await hmisApiRequest<TenantBranding>(
      TENANTS_API_PATHS.branding(viewer.tenantUuid),
      { token: viewer.accessToken },
    );

    return bffSuccess({ branding: normalizeBrandingLogoUrl(branding) });
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

    return bffSuccess({ branding: normalizeBrandingLogoUrl(branding) });
  } catch (error) {
    return bffError(error);
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireTenantAdmin();
    if ("error" in admin) {
      return admin.error;
    }

    const formData = await request.formData();
    const branding = await hmisApiRequest<TenantBranding>(
      TENANTS_API_PATHS.branding(admin.tenantUuid),
      {
        method: "POST",
        token: admin.accessToken,
        body: formData,
      },
    );

    return bffSuccess({ branding: normalizeBrandingLogoUrl(branding) }, 201);
  } catch (error) {
    return bffError(error);
  }
}

export async function DELETE() {
  try {
    const admin = await requireTenantAdmin();
    if ("error" in admin) {
      return admin.error;
    }

    const branding = await hmisApiRequest<TenantBranding>(
      TENANTS_API_PATHS.branding(admin.tenantUuid),
      {
        method: "DELETE",
        token: admin.accessToken,
      },
    );

    return bffSuccess({ branding: normalizeBrandingLogoUrl(branding) });
  } catch (error) {
    return bffError(error);
  }
}
