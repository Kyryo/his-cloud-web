import type { User } from "@/features/auth/types/auth.types";
import type { CustomerVisit } from "@/features/customers/types/customer-visit.types";

export function canCloseCustomerVisit(
  user: User | null,
  visit: CustomerVisit | null,
  clinicIdByUuid: Map<string, number>,
): boolean {
  if (!visit || !user) {
    return false;
  }

  if (user.is_admin) {
    return true;
  }

  const visitClinicUuid = visit.clinic;
  if (!visitClinicUuid) {
    return false;
  }

  const clinicId = clinicIdByUuid.get(visitClinicUuid);
  if (!clinicId) {
    return false;
  }

  const userClinicIds = user.clinics?.map((association) => association.clinic) ?? [];
  return userClinicIds.includes(clinicId);
}

export function getCloseCustomerVisitTooltip(
  user: User | null,
  visit: CustomerVisit | null,
  clinicIdByUuid: Map<string, number>,
): string | undefined {
  if (!visit || !user || user.is_admin) {
    return undefined;
  }

  const visitClinicUuid = visit.clinic;
  if (!visitClinicUuid) {
    return "Unable to determine visit clinic. Contact support if you believe this is an error.";
  }

  const clinicId = clinicIdByUuid.get(visitClinicUuid);
  const userClinicIds = user.clinics?.map((association) => association.clinic) ?? [];

  if (!clinicId || !userClinicIds.includes(clinicId)) {
    const clinicName = visit.clinic_name || "this clinic";
    return `You can only close visits from your assigned clinics. This visit belongs to ${clinicName}, which is not in your assigned clinics.`;
  }

  return undefined;
}
