import type { OpdQueueEncounter } from "@/features/clinical-opd/types/clinical-opd.types";
import { formatVisitPaymentModeLabel } from "@/features/visits/utils/format-visit-payment-mode";

export function formatOpdEncounterPaymentLabel(
  encounter: Pick<OpdQueueEncounter, "mode_of_payment" | "insurance_scheme_name">,
): string {
  return formatVisitPaymentModeLabel(encounter);
}
