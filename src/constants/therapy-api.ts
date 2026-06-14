/** Django DRF v1 Therapy endpoints (relative to HMIS_API_URL, server-only). */
export const THERAPY_API_PATHS = {
  visitAssessment: (discipline: string, visitUuid: string) =>
    `/therapy/${discipline}/visits/${visitUuid}/assessment/`,
  visitSessions: (discipline: string, visitUuid: string) =>
    `/therapy/${discipline}/visits/${visitUuid}/sessions/`,
  visitSession: (
    discipline: string,
    visitUuid: string,
    sessionUuid: string,
  ) =>
    `/therapy/${discipline}/visits/${visitUuid}/sessions/${sessionUuid}/`,
  visitSessionActivities: (discipline: string, visitUuid: string) =>
    `/therapy/${discipline}/visits/${visitUuid}/session-activities/`,
  visitSessionActivity: (
    discipline: string,
    visitUuid: string,
    activityUuid: string,
  ) =>
    `/therapy/${discipline}/visits/${visitUuid}/session-activities/${activityUuid}/`,
  visitTreatmentGoals: (discipline: string, visitUuid: string) =>
    `/therapy/${discipline}/visits/${visitUuid}/treatment-goals/`,
  visitTreatmentPlanDischarge: (discipline: string, visitUuid: string) =>
    `/therapy/${discipline}/visits/${visitUuid}/treatment-plan/discharge/`,
  goalProgress: (
    discipline: string,
    visitUuid: string,
    goalUuid: string,
  ) =>
    `/therapy/${discipline}/visits/${visitUuid}/treatment-goals/${goalUuid}/progress/`,
} as const;
