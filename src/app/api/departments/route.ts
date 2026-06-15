import { DEPARTMENTS_API_PATHS } from "@/constants/departments-api";
import type {
  CreateOrganizationDepartmentPayload,
  OrganizationDepartment,
} from "@/features/settings/types/settings.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { handleClinicalListGet } from "@/lib/server/clinical-bff-handlers";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { requireTenantAdmin } from "@/lib/server/require-tenant-admin";

const QUERY_KEYS = [
  "page",
  "page_size",
  "search",
  "ordering",
  "clinic",
  "department_type",
  "status",
  "is_active",
] as const;

export async function GET(request: Request) {
  return handleClinicalListGet<OrganizationDepartment>(
    request,
    DEPARTMENTS_API_PATHS.list,
    QUERY_KEYS,
    "admin",
    { page_size: "100", ordering: "clinic__name,name" },
  );
}

export async function POST(request: Request) {
  try {
    const admin = await requireTenantAdmin();
    if ("error" in admin) {
      return admin.error;
    }

    const body = (await request.json()) as CreateOrganizationDepartmentPayload;

    if (!body.name?.trim() || !body.code?.trim() || !body.clinic || !body.department_type) {
      return bffSuccess(
        { message: "Name, code, clinic, and department type are required." },
        400,
      );
    }

    const department = await hmisApiRequest<OrganizationDepartment>(
      DEPARTMENTS_API_PATHS.list,
      {
        method: "POST",
        token: admin.accessToken,
        body: {
          name: body.name.trim(),
          code: body.code.trim().toUpperCase(),
          clinic: body.clinic,
          department_type: body.department_type,
          description: body.description?.trim() || "",
          status: body.status ?? "ACTIVE",
          is_active: body.is_active ?? true,
          requires_appointment: body.requires_appointment ?? false,
          walk_in_allowed: body.walk_in_allowed ?? true,
          default_appointment_duration_minutes:
            body.default_appointment_duration_minutes ?? 30,
        },
      },
    );

    return bffSuccess(department, 201);
  } catch (error) {
    return bffError(error);
  }
}
