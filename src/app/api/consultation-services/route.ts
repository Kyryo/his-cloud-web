import { CONSULTATION_SERVICES_API_PATHS } from "@/constants/consultation-services-api";
import type {
  CreateOrganizationServicePayload,
  OrganizationService,
} from "@/features/settings/types/settings.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { handleClinicalListGet } from "@/lib/server/clinical-bff-handlers";
import { requireTenantAdmin } from "@/lib/server/require-tenant-admin";

const QUERY_KEYS = ["page", "page_size", "search", "ordering"] as const;

export async function GET(request: Request) {
  return handleClinicalListGet<OrganizationService>(
    request,
    CONSULTATION_SERVICES_API_PATHS.list,
    QUERY_KEYS,
    "admin",
    { page_size: "100" },
  );
}

export async function POST(request: Request) {
  try {
    const admin = await requireTenantAdmin();
    if ("error" in admin) {
      return admin.error;
    }

    const body = (await request.json()) as CreateOrganizationServicePayload;

    if (!body.name?.trim()) {
      return bffSuccess({ message: "Name is required." }, 400);
    }

    const service = await hmisApiRequest<OrganizationService>(
      CONSULTATION_SERVICES_API_PATHS.list,
      {
        method: "POST",
        token: admin.accessToken,
        body: {
          name: body.name.trim(),
          code: body.code?.trim() || "",
          description: body.description?.trim() || "",
          is_chargable: body.is_chargable ?? true,
          is_active: body.is_active ?? true,
        },
      },
    );

    return bffSuccess(service, 201);
  } catch (error) {
    return bffError(error);
  }
}
