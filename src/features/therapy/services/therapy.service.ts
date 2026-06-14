import { BFF_THERAPY_ROUTES, BFF_VISITS_ROUTES } from "@/constants/api";
import type {
  TherapyDepartment,
  TherapyDiscipline,
  TherapyAssessment,
  AssignTherapyTreatmentPlanPayload,
  TherapySessionPayload,
  CreateTherapyTreatmentGoalPayload,
  TherapyFutureAppointment,
  TherapyGoalProgress,
  TherapySession,
  TherapySessionActivitiesResponse,
  TherapySessionActivity,
  TherapySessionActivityPayload,
  TherapyTreatmentGoal,
  TherapyTreatmentPlan,
  TherapyVisit,
  TherapyVisitTreatmentGoals,
  TherapyVisitListResponse,
  TherapyVisitStatus,
} from "@/features/therapy/types/therapy.types";
import { bffRequest } from "@/lib/bff-client";

export async function fetchTherapyVisitAssessment(
  discipline: TherapyDiscipline,
  visitUuid: string,
): Promise<TherapyAssessment | null> {
  return bffRequest<TherapyAssessment | null>(
    BFF_THERAPY_ROUTES.visitAssessment(discipline, visitUuid),
  );
}

export async function createTherapyVisitAssessment(
  discipline: TherapyDiscipline,
  visitUuid: string,
): Promise<TherapyAssessment> {
  return bffRequest<TherapyAssessment>(
    BFF_THERAPY_ROUTES.visitAssessment(discipline, visitUuid),
    { method: "POST", body: {} },
  );
}

export async function updateTherapyVisitAssessment(
  discipline: TherapyDiscipline,
  visitUuid: string,
  assessmentNotes: string,
): Promise<TherapyAssessment> {
  return bffRequest<TherapyAssessment>(
    BFF_THERAPY_ROUTES.visitAssessment(discipline, visitUuid),
    { method: "PUT", body: { assessment_notes: assessmentNotes } },
  );
}

export async function fetchTherapyDepartments(
  discipline: TherapyDiscipline,
  activeClinicId: number,
): Promise<TherapyDepartment[]> {
  const params = new URLSearchParams({
    discipline,
    active_clinic_id: String(activeClinicId),
  });
  const response = await bffRequest<{
    results: TherapyDepartment[];
  }>(`${BFF_THERAPY_ROUTES.departments}?${params.toString()}`);

  return response.results;
}

export async function fetchTherapyVisitDetails(
  discipline: TherapyDiscipline,
  visitUuid: string,
): Promise<TherapyVisit> {
  return bffRequest<TherapyVisit>(
    BFF_THERAPY_ROUTES.visitDetails(discipline, visitUuid),
  );
}

export async function fetchTherapyVisitSessions(
  discipline: TherapyDiscipline,
  visitUuid: string,
): Promise<TherapySession[]> {
  const response = await bffRequest<{ results: TherapySession[] }>(
    BFF_THERAPY_ROUTES.visitSessions(discipline, visitUuid),
  );
  return response.results;
}

export async function createTherapyVisitSession(
  discipline: TherapyDiscipline,
  visitUuid: string,
  payload: TherapySessionPayload,
): Promise<TherapySession> {
  return bffRequest<TherapySession>(
    BFF_THERAPY_ROUTES.visitSessions(discipline, visitUuid),
    { method: "POST", body: payload },
  );
}

export async function updateTherapyVisitSession(
  discipline: TherapyDiscipline,
  visitUuid: string,
  sessionUuid: string,
  payload: TherapySessionPayload,
): Promise<TherapySession> {
  return bffRequest<TherapySession>(
    BFF_THERAPY_ROUTES.visitSession(discipline, visitUuid, sessionUuid),
    { method: "PUT", body: payload },
  );
}

export async function removeTherapyVisitSession(
  discipline: TherapyDiscipline,
  visitUuid: string,
  sessionUuid: string,
): Promise<void> {
  return bffRequest<void>(
    BFF_THERAPY_ROUTES.visitSession(discipline, visitUuid, sessionUuid),
    { method: "DELETE" },
  );
}

export async function fetchTherapyVisitSessionActivities(
  discipline: TherapyDiscipline,
  visitUuid: string,
): Promise<TherapySessionActivitiesResponse> {
  return bffRequest<TherapySessionActivitiesResponse>(
    BFF_THERAPY_ROUTES.visitSessionActivities(discipline, visitUuid),
  );
}

export async function createTherapyVisitSessionActivity(
  discipline: TherapyDiscipline,
  visitUuid: string,
  payload: TherapySessionActivityPayload,
): Promise<TherapySessionActivity> {
  return bffRequest<TherapySessionActivity>(
    BFF_THERAPY_ROUTES.visitSessionActivities(discipline, visitUuid),
    { method: "POST", body: payload },
  );
}

export async function updateTherapyVisitSessionActivity(
  discipline: TherapyDiscipline,
  visitUuid: string,
  activityUuid: string,
  payload: TherapySessionActivityPayload,
): Promise<TherapySessionActivity> {
  return bffRequest<TherapySessionActivity>(
    BFF_THERAPY_ROUTES.visitSessionActivity(
      discipline,
      visitUuid,
      activityUuid,
    ),
    { method: "PUT", body: payload },
  );
}

export async function removeTherapyVisitSessionActivity(
  discipline: TherapyDiscipline,
  visitUuid: string,
  activityUuid: string,
): Promise<void> {
  return bffRequest<void>(
    BFF_THERAPY_ROUTES.visitSessionActivity(
      discipline,
      visitUuid,
      activityUuid,
    ),
    { method: "DELETE" },
  );
}

export async function fetchTherapyVisitTreatmentGoals(
  discipline: TherapyDiscipline,
  visitUuid: string,
): Promise<TherapyVisitTreatmentGoals> {
  return bffRequest<TherapyVisitTreatmentGoals>(
    BFF_THERAPY_ROUTES.treatmentGoals(discipline, visitUuid),
  );
}

export async function createTherapyVisitTreatmentGoal(
  discipline: TherapyDiscipline,
  visitUuid: string,
  payload: CreateTherapyTreatmentGoalPayload,
): Promise<TherapyTreatmentGoal> {
  return bffRequest<TherapyTreatmentGoal>(
    BFF_THERAPY_ROUTES.treatmentGoals(discipline, visitUuid),
    { method: "POST", body: payload },
  );
}

export async function assignTherapyVisitTreatmentPlan(
  discipline: TherapyDiscipline,
  visitUuid: string,
  payload: AssignTherapyTreatmentPlanPayload,
): Promise<TherapyTreatmentPlan> {
  return bffRequest<TherapyTreatmentPlan>(
    BFF_THERAPY_ROUTES.treatmentGoals(discipline, visitUuid),
    { method: "PUT", body: payload },
  );
}

export async function dischargeTherapyVisitTreatmentPlan(
  discipline: TherapyDiscipline,
  visitUuid: string,
  dischargeSummary: string,
): Promise<TherapyTreatmentPlan> {
  return bffRequest<TherapyTreatmentPlan>(
    BFF_THERAPY_ROUTES.treatmentPlanDischarge(discipline, visitUuid),
    {
      method: "POST",
      body: { discharge_summary: dischargeSummary },
    },
  );
}

export async function recordTherapyGoalProgress(
  discipline: TherapyDiscipline,
  visitUuid: string,
  goalUuid: string,
  payload: {
    measured_value?: string;
    boolean_value?: boolean;
    notes?: string;
  },
): Promise<TherapyGoalProgress> {
  return bffRequest<TherapyGoalProgress>(
    BFF_THERAPY_ROUTES.goalProgress(discipline, visitUuid, goalUuid),
    { method: "POST", body: payload },
  );
}

export async function fetchTherapyFutureAppointments(
  discipline: TherapyDiscipline,
  visitUuid: string,
): Promise<TherapyFutureAppointment[]> {
  const response = await bffRequest<{ results: TherapyFutureAppointment[] }>(
    BFF_THERAPY_ROUTES.futureAppointments(discipline, visitUuid),
  );
  return response.results;
}

export async function fetchTherapyVisits({
  discipline,
  activeClinicId,
  departmentUuid,
  page,
  pageSize,
  search,
  status,
}: {
  discipline: TherapyDiscipline;
  activeClinicId: number;
  departmentUuid: string;
  page: number;
  pageSize: number;
  search?: string;
  status?: TherapyVisitStatus | "all";
}): Promise<TherapyVisitListResponse> {
  const params = new URLSearchParams({
    discipline,
    active_clinic_id: String(activeClinicId),
    department_uuid: departmentUuid,
    page: String(page),
    page_size: String(pageSize),
  });

  if (search?.trim()) {
    params.set("search", search.trim());
  }
  if (status && status !== "all") {
    params.set("status", status);
  }

  return bffRequest<TherapyVisitListResponse>(
    `${BFF_VISITS_ROUTES.list}?${params.toString()}`,
  );
}
