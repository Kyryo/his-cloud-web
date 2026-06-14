import { VISITS_API_PATHS } from "@/constants/visits-api";
import type {
  CreateVisitPayload,
  CustomerVisit,
} from "@/features/customers/types/customer-visit.types";
import type {
  TherapyDepartment,
  TherapyVisit,
} from "@/features/therapy/types/therapy.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import {
  hmisApiRequest,
  hmisApiRequestWithMeta,
} from "@/lib/server/hmis-api";
import { requireAccessToken } from "@/lib/server/require-access-token";
import { DEPARTMENTS_API_PATHS } from "@/constants/tenants-api";
import {
  isServerTherapyDiscipline,
  requireTherapyAccess,
} from "@/lib/server/require-therapy-access";

const VISIT_QUERY_KEYS = [
  "department_uuid",
  "page",
  "page_size",
  "search",
  "status",
] as const;

export async function GET(request: Request) {
  try {
    const incoming = new URL(request.url).searchParams;
    const discipline = incoming.get("discipline");
    const departmentUuid = incoming.get("department_uuid");
    const activeClinicId = Number(incoming.get("active_clinic_id"));

    if (!isServerTherapyDiscipline(discipline)) {
      return bffSuccess({ message: "Invalid therapy discipline." }, 400);
    }
    if (!departmentUuid) {
      return bffSuccess({ message: "Department UUID is required." }, 400);
    }
    if (!Number.isInteger(activeClinicId) || activeClinicId <= 0) {
      return bffSuccess({ message: "Active clinic is required." }, 400);
    }

    const auth = await requireTherapyAccess(discipline);
    if ("error" in auth) {
      return bffSuccess({ message: auth.error }, auth.status);
    }

    const department = await hmisApiRequest<TherapyDepartment>(
      DEPARTMENTS_API_PATHS.detail(departmentUuid),
      { token: auth.accessToken },
    );
    if (
      department.department_type !== discipline ||
      department.clinic !== activeClinicId
    ) {
      return bffSuccess(
        {
          message:
            "Department does not match the active clinic and therapy discipline.",
        },
        400,
      );
    }

    const params = new URLSearchParams();
    for (const key of VISIT_QUERY_KEYS) {
      const value = incoming.get(key);
      if (value) {
        params.set(key, value);
      }
    }

    const { data, meta } = await hmisApiRequestWithMeta<TherapyVisit[]>(
      `${VISITS_API_PATHS.list}?${params.toString()}`,
      { token: auth.accessToken },
    );

    return bffSuccess({
      results: data,
      pagination: meta.pagination ?? null,
    });
  } catch (error) {
    return bffError(error);
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }

    const body = (await request.json()) as CreateVisitPayload;

    if (!body.visit_type?.trim()) {
      return bffSuccess({ message: "Visit type is required." }, 400);
    }

    if (!body.customer?.trim()) {
      return bffSuccess({ message: "Customer is required." }, 400);
    }

    const visit = await hmisApiRequest<CustomerVisit>(VISITS_API_PATHS.list, {
      method: "POST",
      token: auth.accessToken,
      body: {
        visit_type: body.visit_type,
        customer: body.customer,
        visit_date: body.visit_date,
        mode_of_payment: body.mode_of_payment ?? "cash",
        insurance_scheme: body.insurance_scheme ?? null,
        requires_pre_authorization: body.requires_pre_authorization ?? false,
        pre_authorization_number: body.pre_authorization_number ?? "",
        pre_authorization_comments: body.pre_authorization_comments ?? "",
      },
    });

    return bffSuccess(visit, 201);
  } catch (error) {
    return bffError(error);
  }
}
