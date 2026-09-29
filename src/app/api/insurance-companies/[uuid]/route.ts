import { INSURANCE_API_PATHS } from "@/constants/insurance-api";
import type {
  OrganizationPayer,
  UpdateOrganizationPayerPayload,
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
    const body = (await request.json()) as UpdateOrganizationPayerPayload;
    const payload: UpdateOrganizationPayerPayload = {};

    if (body.name !== undefined) {
      if (!body.name.trim()) {
        return bffSuccess({ message: "Name is required." }, 400);
      }
      payload.name = body.name.trim();
    }

    if (body.code !== undefined) {
      if (!body.code.trim()) {
        return bffSuccess({ message: "Code is required." }, 400);
      }
      payload.code = body.code.trim();
    }

    if (body.description !== undefined) {
      payload.description = body.description.trim();
    }

    if (body.phone_number !== undefined) {
      payload.phone_number = body.phone_number.trim();
    }

    if (body.email !== undefined) {
      payload.email = body.email.trim();
    }

    if (body.address !== undefined) {
      payload.address = body.address.trim();
    }

    if (body.is_active !== undefined) {
      if (typeof body.is_active !== "boolean") {
        return bffSuccess({ message: "is_active must be true or false." }, 400);
      }
      payload.is_active = body.is_active;
    }

    if (body.registry_payer !== undefined) {
      payload.registry_payer = body.registry_payer;
    }

    if (Object.keys(payload).length === 0) {
      return bffSuccess({ message: "No payer changes were provided." }, 400);
    }

    const payer = await hmisApiRequest<OrganizationPayer>(
      INSURANCE_API_PATHS.companyDetail(uuid),
      {
        method: "PATCH",
        token: admin.accessToken,
        body: payload,
      },
    );

    return bffSuccess(payer);
  } catch (error) {
    return bffError(error);
  }
}
