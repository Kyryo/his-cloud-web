import { TENANTS_API_PATHS } from "@/constants/tenants-api";
import type {
  TenantDetail,
  UpdateOrganizationContactPayload,
} from "@/features/settings/types/settings.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { requireTenantAdmin } from "@/lib/server/require-tenant-admin";

const UPDATABLE_CONTACT_FIELDS = [
  "email",
  "phone",
  "address",
  "city",
  "state_province",
  "country",
  "postal_code",
] as const satisfies ReadonlyArray<keyof UpdateOrganizationContactPayload>;

function pickContactPayload(body: UpdateOrganizationContactPayload) {
  const payload: UpdateOrganizationContactPayload = {};

  for (const field of UPDATABLE_CONTACT_FIELDS) {
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

    const tenant = await hmisApiRequest<TenantDetail>(
      TENANTS_API_PATHS.detail(admin.tenantUuid),
      {
        token: admin.accessToken,
      },
    );

    return bffSuccess({ tenant });
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

    const body = (await request.json()) as UpdateOrganizationContactPayload;
    const payload = pickContactPayload(body);

    if (Object.keys(payload).length === 0) {
      return bffSuccess({ message: "No valid fields to update." }, 400);
    }

    const tenant = await hmisApiRequest<TenantDetail>(
      TENANTS_API_PATHS.detail(admin.tenantUuid),
      {
        method: "PATCH",
        token: admin.accessToken,
        body: payload,
      },
    );

    return bffSuccess({ tenant });
  } catch (error) {
    return bffError(error);
  }
}
