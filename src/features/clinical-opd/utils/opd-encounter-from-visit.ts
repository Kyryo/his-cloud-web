import type { OpdQueueEncounter } from "@/features/clinical-opd/types/clinical-opd.types";
import type { VisitDetail } from "@/features/visits/types/visit.types";

export function opdEncounterFromVisit(
  visit: VisitDetail,
  encounterUuid: string,
  queueRow?: OpdQueueEncounter | null,
): OpdQueueEncounter | null {
  const encounter = visit.encounters.find((item) => item.uuid === encounterUuid);
  if (!encounter) {
    return queueRow ?? null;
  }

  return {
    encounter_uuid: encounter.uuid,
    visit_uuid: visit.uuid,
    visit_status: visit.status,
    customer_uuid: visit.customer,
    customer_name: visit.customer_name,
    customer_identifier: visit.customer_identifier,
    clinic_name: visit.clinic_name,
    department_name: encounter.department_name,
    status: encounter.status,
    started_at: encounter.started_at,
    mode_of_payment: visit.mode_of_payment,
    insurance_scheme_name: visit.insurance_scheme_name,
    queue_stage: queueRow?.queue_stage ?? null,
    triaged_at: queueRow?.triaged_at ?? null,
    waiting_minutes: queueRow?.waiting_minutes ?? null,
    latest_vitals: queueRow?.latest_vitals ?? [],
    allergy_count: queueRow?.allergy_count ?? null,
    highest_allergy_severity: queueRow?.highest_allergy_severity ?? null,
  };
}
