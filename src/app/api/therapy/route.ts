import { DEPARTMENTS_API_PATHS } from "@/constants/tenants-api";
import type { TherapyDepartment } from "@/features/therapy/types/therapy.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequestWithMeta } from "@/lib/server/hmis-api";
import {
  isServerTherapyDiscipline,
  requireTherapyAccess,
} from "@/lib/server/require-therapy-access";

export async function GET(request: Request) {
  try {
    const incoming = new URL(request.url).searchParams;
    const discipline = incoming.get("discipline");
    const activeClinicId = Number(incoming.get("active_clinic_id"));
    if (!isServerTherapyDiscipline(discipline)) {
      return bffSuccess({ message: "Invalid therapy discipline." }, 400);
    }
    if (!Number.isInteger(activeClinicId) || activeClinicId <= 0) {
      return bffSuccess({ message: "Active clinic is required." }, 400);
    }

    const auth = await requireTherapyAccess(discipline);
    if ("error" in auth) {
      return bffSuccess({ message: auth.error }, auth.status);
    }
    const hasClinicAccess = (auth.user.clinics ?? []).some(
      (clinic) => clinic.clinic === activeClinicId && clinic.is_active,
    );
    if (!hasClinicAccess) {
      return bffSuccess(
        { message: "You do not have access to the active clinic." },
        403,
      );
    }

    const params = new URLSearchParams({
      department_type: discipline,
      clinic: String(activeClinicId),
      is_active: "true",
      page_size: "100",
      ordering: "name",
    });
    const { data, meta } = await hmisApiRequestWithMeta<TherapyDepartment[]>(
      `${DEPARTMENTS_API_PATHS.list}?${params.toString()}`,
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
