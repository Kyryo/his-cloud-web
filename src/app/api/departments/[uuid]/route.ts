import { DEPARTMENTS_API_PATHS } from "@/constants/departments-api";
import type {
  OrganizationDepartment,
  UpdateOrganizationDepartmentPayload,
} from "@/features/settings/types/settings.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { requireTenantAdmin } from "@/lib/server/require-tenant-admin";

type RouteContext = {
  params: Promise<{ uuid: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const admin = await requireTenantAdmin();
    if ("error" in admin) {
      return admin.error;
    }

    const { uuid } = await context.params;
    const body = (await request.json()) as UpdateOrganizationDepartmentPayload;

    if (!body.name?.trim() || !body.code?.trim() || !body.clinic || !body.department_type) {
      return bffSuccess(
        { message: "Name, code, clinic, and department type are required." },
        400,
      );
    }

    const department = await hmisApiRequest<OrganizationDepartment>(
      DEPARTMENTS_API_PATHS.detail(uuid),
      {
        method: "PATCH",
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

    return bffSuccess(department);
  } catch (error) {
    return bffError(error);
  }
}
