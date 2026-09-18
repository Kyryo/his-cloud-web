import type { AllergyAlert } from "@/features/clinical-opd/types/clinical-opd.types";

export function formatAllergyAlertMessage(alerts: AllergyAlert[]) {
  return alerts
    .map((alert) => `${alert.allergy_name} (${alert.severity})`)
    .join(" · ");
}
