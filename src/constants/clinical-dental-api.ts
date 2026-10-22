const upstreamEncounter = (visitUuid: string, encounterUuid: string) =>
  `/dental/visits/${visitUuid}/encounters/${encounterUuid}`;

const bffEncounter = (visitUuid: string, encounterUuid: string) =>
  `/api/dental/visits/${visitUuid}/encounters/${encounterUuid}`;

function encounterPaths(base: (visitUuid: string, encounterUuid: string) => string, trailing: string) {
  return {
    chart: (visitUuid: string, encounterUuid: string) =>
      `${base(visitUuid, encounterUuid)}/chart${trailing}`,
    chartFindings: (visitUuid: string, encounterUuid: string) =>
      `${base(visitUuid, encounterUuid)}/chart/findings${trailing}`,
    chartFinding: (visitUuid: string, encounterUuid: string, findingUuid: string) =>
      `${base(visitUuid, encounterUuid)}/chart/findings/${findingUuid}${trailing}`,
    toothHistory: (visitUuid: string, encounterUuid: string, toothNumber: number) =>
      `${base(visitUuid, encounterUuid)}/teeth/${toothNumber}/history${trailing}`,
    procedures: (visitUuid: string, encounterUuid: string) =>
      `${base(visitUuid, encounterUuid)}/procedures${trailing}`,
    procedure: (
      visitUuid: string,
      encounterUuid: string,
      procedureUuid: string,
    ) =>
      `${base(visitUuid, encounterUuid)}/procedures/${procedureUuid}${trailing}`,
    treatmentPlans: (visitUuid: string, encounterUuid: string) =>
      `${base(visitUuid, encounterUuid)}/treatment-plans${trailing}`,
    treatmentPlan: (visitUuid: string, encounterUuid: string, planUuid: string) =>
      `${base(visitUuid, encounterUuid)}/treatment-plans/${planUuid}${trailing}`,
    treatmentPlanItems: (visitUuid: string, encounterUuid: string, planUuid: string) =>
      `${base(visitUuid, encounterUuid)}/treatment-plans/${planUuid}/items${trailing}`,
    treatmentPlanItem: (visitUuid: string, encounterUuid: string, itemUuid: string) =>
      `${base(visitUuid, encounterUuid)}/treatment-plan-items/${itemUuid}${trailing}`,
    performPlanItem: (visitUuid: string, encounterUuid: string, itemUuid: string) =>
      `${base(visitUuid, encounterUuid)}/treatment-plan-items/${itemUuid}/perform${trailing}`,
    dentalHistory: (visitUuid: string, encounterUuid: string) =>
      `${base(visitUuid, encounterUuid)}/dental-history${trailing}`,
    historySections: (visitUuid: string, encounterUuid: string) =>
      `${base(visitUuid, encounterUuid)}/history-sections${trailing}`,
  } as const;
}

/** Django DRF v1 dental EMR endpoints (relative to HMIS_API_URL, server-only). */
export const CLINICAL_DENTAL_API_PATHS = encounterPaths(upstreamEncounter, "/");

/** Browser-facing BFF dental EMR routes (same origin). */
export const BFF_CLINICAL_DENTAL_ROUTES = encounterPaths(bffEncounter, "");
