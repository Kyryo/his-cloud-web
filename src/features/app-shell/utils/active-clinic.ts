export const ACTIVE_CLINIC_STORAGE_KEY = "hmis-active-clinic-id";
export const ACTIVE_CLINIC_CHANGE_EVENT = "hmis-active-clinic-change";

export function readActiveClinicId(): number | null {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = window.localStorage.getItem(ACTIVE_CLINIC_STORAGE_KEY);
  if (!stored) {
    return null;
  }

  const clinicId = Number(stored);
  return Number.isInteger(clinicId) && clinicId > 0 ? clinicId : null;
}

export function writeActiveClinicId(clinicId: number): void {
  window.localStorage.setItem(ACTIVE_CLINIC_STORAGE_KEY, String(clinicId));
  window.dispatchEvent(
    new CustomEvent<number>(ACTIVE_CLINIC_CHANGE_EVENT, {
      detail: clinicId,
    }),
  );
}
