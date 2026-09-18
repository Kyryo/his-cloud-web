import type {
  EncounterClinicalOrder,
  EncounterObservation,
  EncounterPrescription,
} from "@/features/clinical-opd/types/clinical-opd.types";
import type { OpdEncounterTabId } from "@/features/clinical-opd/utils/opd-encounter-tabs";

export type OpdEncounterTabCounts = Partial<Record<OpdEncounterTabId, number>>;

type OpdEncounterTabCountsInput = {
  observations?: EncounterObservation[];
  orders?: EncounterClinicalOrder[];
  prescriptions?: EncounterPrescription[];
};

/**
 * Counts shown next to tab labels. Cancelled records are excluded so the badge
 * matches what each tab actually lists.
 */
export function buildOpdEncounterTabCounts({
  observations,
  orders,
  prescriptions,
}: OpdEncounterTabCountsInput): OpdEncounterTabCounts {
  const counts: OpdEncounterTabCounts = {};

  const vitalsCount = observations?.length ?? 0;
  if (vitalsCount > 0) {
    counts["vital-signs"] = vitalsCount;
  }

  const ordersCount = (orders ?? []).filter(
    (order) => order.status !== "CANCELLED" && order.is_active !== false,
  ).length;
  if (ordersCount > 0) {
    counts.orders = ordersCount;
  }

  const medicationsCount = (prescriptions ?? []).filter(
    (prescription) => prescription.status !== "cancelled",
  ).length;
  if (medicationsCount > 0) {
    counts.medications = medicationsCount;
  }

  return counts;
}
