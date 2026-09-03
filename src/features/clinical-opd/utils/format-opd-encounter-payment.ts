import type { OpdQueueEncounter } from "@/features/clinical-opd/types/clinical-opd.types";

export function formatOpdEncounterPaymentLabel(
  encounter: Pick<OpdQueueEncounter, "mode_of_payment" | "insurance_scheme_name">,
): string {
  const modeLabel = encounter.mode_of_payment === "insurance" ? "Insurance" : "Cash";

  if (encounter.mode_of_payment === "insurance" && encounter.insurance_scheme_name) {
    return `${modeLabel} · ${encounter.insurance_scheme_name}`;
  }

  return modeLabel;
}
