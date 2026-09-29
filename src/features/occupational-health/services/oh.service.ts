import { BFF_OCCUPATIONAL_HEALTH_ROUTES } from "@/constants/api";
import type {
  EmploymentEpisode,
  FitnessAssessment,
  FitnessCertificate,
  FoodHandlerClearance,
  IodCase,
  OhCampaignQueueRow,
  OhComplianceDashboard,
  OhEmployer,
  OhEmployerSite,
  OhExamFinding,
  OhExamination,
  OhFitnessValidityAlert,
  OhHazard,
  OhHazardProfile,
  OhHrFitnessRow,
  OhImmunisation,
  OhJobTitle,
  OhVisitEncounter,
  PpeFitTest,
  SickLeaveCertificate,
  SurveillanceRequirement,
} from "@/features/occupational-health/types";
import { bffRequest } from "@/lib/bff-client";

type ListResponse<T> = {
  results: T[];
  pagination?: unknown;
};

function listQuery(params?: Record<string, string | undefined>) {
  const searchParams = new URLSearchParams();
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value) {
        searchParams.set(key, value);
      }
    }
  }
  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export async function fetchOhEncounters(params?: {
  page?: number;
  pageSize?: number;
}) {
  const response = await bffRequest<ListResponse<OhVisitEncounter>>(
    `${BFF_OCCUPATIONAL_HEALTH_ROUTES.encounters}${listQuery({
      page: params?.page ? String(params.page) : undefined,
      page_size: params?.pageSize ? String(params.pageSize) : undefined,
    })}`,
  );
  return response.results;
}

export async function fetchEmploymentEpisodes(customerUuid?: string) {
  const response = await bffRequest<ListResponse<EmploymentEpisode>>(
    `${BFF_OCCUPATIONAL_HEALTH_ROUTES.employmentEpisodes}${listQuery({
      customer: customerUuid,
    })}`,
  );
  return response.results;
}

export async function createEmploymentEpisode(payload: Record<string, unknown>) {
  return bffRequest<EmploymentEpisode>(
    BFF_OCCUPATIONAL_HEALTH_ROUTES.employmentEpisodes,
    { method: "POST", body: payload },
  );
}

export async function fetchOhEmployers() {
  const response = await bffRequest<ListResponse<OhEmployer>>(
    BFF_OCCUPATIONAL_HEALTH_ROUTES.employers,
  );
  return response.results;
}

export async function createOhEmployer(payload: {
  name: string;
  code?: string;
  registration_number?: string;
}) {
  return bffRequest<OhEmployer>(BFF_OCCUPATIONAL_HEALTH_ROUTES.employers, {
    method: "POST",
    body: payload,
  });
}

export async function fetchOhJobTitles(employerId?: number) {
  const response = await bffRequest<ListResponse<OhJobTitle>>(
    `${BFF_OCCUPATIONAL_HEALTH_ROUTES.jobTitles}${listQuery({
      employer: employerId ? String(employerId) : undefined,
    })}`,
  );
  return response.results;
}

export async function createOhJobTitle(payload: {
  title: string;
  code?: string;
  employer: number;
}) {
  return bffRequest<OhJobTitle>(BFF_OCCUPATIONAL_HEALTH_ROUTES.jobTitles, {
    method: "POST",
    body: payload,
  });
}

export async function fetchOhEmployerSites(employerId?: number) {
  const response = await bffRequest<ListResponse<OhEmployerSite>>(
    `${BFF_OCCUPATIONAL_HEALTH_ROUTES.employerSites}${listQuery({
      employer: employerId ? String(employerId) : undefined,
    })}`,
  );
  return response.results;
}

export async function createOhEmployerSite(payload: {
  name: string;
  code?: string;
  address?: string;
  employer: number;
}) {
  return bffRequest<OhEmployerSite>(BFF_OCCUPATIONAL_HEALTH_ROUTES.employerSites, {
    method: "POST",
    body: payload,
  });
}

export async function fetchOhHazards() {
  const response = await bffRequest<ListResponse<OhHazard>>(
    BFF_OCCUPATIONAL_HEALTH_ROUTES.hazards,
  );
  return response.results;
}

export async function createOhHazard(payload: {
  code: string;
  name: string;
  description?: string;
}) {
  return bffRequest<OhHazard>(BFF_OCCUPATIONAL_HEALTH_ROUTES.hazards, {
    method: "POST",
    body: payload,
  });
}

export async function fetchOhHazardProfiles() {
  const response = await bffRequest<ListResponse<OhHazardProfile>>(
    BFF_OCCUPATIONAL_HEALTH_ROUTES.hazardProfiles,
  );
  return response.results;
}

export async function createOhHazardProfile(payload: {
  name: string;
  code?: string;
  hazards?: number[];
}) {
  return bffRequest<OhHazardProfile>(
    BFF_OCCUPATIONAL_HEALTH_ROUTES.hazardProfiles,
    { method: "POST", body: payload },
  );
}

export async function fetchOhExaminations() {
  const response = await bffRequest<ListResponse<OhExamination>>(
    BFF_OCCUPATIONAL_HEALTH_ROUTES.examinations,
  );
  return response.results;
}

export async function createOhExamination(payload: Record<string, unknown>) {
  return bffRequest<OhExamination>(
    BFF_OCCUPATIONAL_HEALTH_ROUTES.examinations,
    { method: "POST", body: payload },
  );
}

export async function fetchOhExamFindings() {
  const response = await bffRequest<ListResponse<OhExamFinding>>(
    BFF_OCCUPATIONAL_HEALTH_ROUTES.examFindings,
  );
  return response.results;
}

export async function createOhExamFinding(payload: Record<string, unknown>) {
  return bffRequest<OhExamFinding>(
    BFF_OCCUPATIONAL_HEALTH_ROUTES.examFindings,
    { method: "POST", body: payload },
  );
}

export async function fetchFitnessAssessments() {
  const response = await bffRequest<ListResponse<FitnessAssessment>>(
    BFF_OCCUPATIONAL_HEALTH_ROUTES.fitnessAssessments,
  );
  return response.results;
}

export async function createFitnessAssessment(payload: Record<string, unknown>) {
  return bffRequest<FitnessAssessment>(
    BFF_OCCUPATIONAL_HEALTH_ROUTES.fitnessAssessments,
    { method: "POST", body: payload },
  );
}

export async function fetchIodCases() {
  const response = await bffRequest<ListResponse<IodCase>>(
    BFF_OCCUPATIONAL_HEALTH_ROUTES.iodCases,
  );
  return response.results;
}

export async function createIodCase(payload: Record<string, unknown>) {
  return bffRequest<IodCase>(BFF_OCCUPATIONAL_HEALTH_ROUTES.iodCases, {
    method: "POST",
    body: payload,
  });
}

export async function fetchOhComplianceDashboard() {
  return bffRequest<OhComplianceDashboard>(
    BFF_OCCUPATIONAL_HEALTH_ROUTES.complianceDashboard,
  );
}

export async function fetchOhCampaignQueue() {
  return bffRequest<OhCampaignQueueRow[]>(
    BFF_OCCUPATIONAL_HEALTH_ROUTES.campaignQueue,
  );
}

export async function fetchSurveillanceRequirements(params?: {
  status?: string;
  site?: string;
  department?: string;
  job?: string;
  hazard?: string;
  hazard_profile?: string;
  due_before?: string;
  due_after?: string;
}) {
  const response = await bffRequest<ListResponse<SurveillanceRequirement>>(
    `${BFF_OCCUPATIONAL_HEALTH_ROUTES.surveillanceRequirements}${listQuery({
      status: params?.status,
      site: params?.site,
      department: params?.department,
      job: params?.job,
      hazard: params?.hazard,
      hazard_profile: params?.hazard_profile,
      due_before: params?.due_before,
      due_after: params?.due_after,
    })}`,
  );
  return response.results;
}

export async function fetchFitnessValidityAlerts() {
  return bffRequest<OhFitnessValidityAlert[]>(
    BFF_OCCUPATIONAL_HEALTH_ROUTES.fitnessValidityAlerts,
  );
}

export async function fetchFitnessCertificates() {
  const response = await bffRequest<ListResponse<FitnessCertificate>>(
    BFF_OCCUPATIONAL_HEALTH_ROUTES.fitnessCertificates,
  );
  return response.results;
}

export async function createFitnessCertificate(payload: Record<string, unknown>) {
  return bffRequest<FitnessCertificate>(
    BFF_OCCUPATIONAL_HEALTH_ROUTES.fitnessCertificates,
    { method: "POST", body: payload },
  );
}

export async function amendFitnessCertificate(
  uuid: string,
  payload: Record<string, unknown>,
) {
  return bffRequest<FitnessCertificate>(
    BFF_OCCUPATIONAL_HEALTH_ROUTES.fitnessCertificateAmend(uuid),
    { method: "POST", body: payload },
  );
}

export async function withdrawFitnessCertificate(uuid: string) {
  return bffRequest<FitnessCertificate>(
    BFF_OCCUPATIONAL_HEALTH_ROUTES.fitnessCertificateWithdraw(uuid),
    { method: "POST", body: {} },
  );
}

export async function fetchOhImmunisations() {
  const response = await bffRequest<ListResponse<OhImmunisation>>(
    BFF_OCCUPATIONAL_HEALTH_ROUTES.ohImmunisations,
  );
  return response.results;
}

export async function createOhImmunisation(payload: Record<string, unknown>) {
  return bffRequest<OhImmunisation>(
    BFF_OCCUPATIONAL_HEALTH_ROUTES.ohImmunisations,
    { method: "POST", body: payload },
  );
}

export async function fetchPpeFitTests() {
  const response = await bffRequest<ListResponse<PpeFitTest>>(
    BFF_OCCUPATIONAL_HEALTH_ROUTES.ppeFitTests,
  );
  return response.results;
}

export async function createPpeFitTest(payload: Record<string, unknown>) {
  return bffRequest<PpeFitTest>(BFF_OCCUPATIONAL_HEALTH_ROUTES.ppeFitTests, {
    method: "POST",
    body: payload,
  });
}

export async function fetchFoodHandlerClearances() {
  const response = await bffRequest<ListResponse<FoodHandlerClearance>>(
    BFF_OCCUPATIONAL_HEALTH_ROUTES.foodHandlerClearances,
  );
  return response.results;
}

export async function createFoodHandlerClearance(
  payload: Record<string, unknown>,
) {
  return bffRequest<FoodHandlerClearance>(
    BFF_OCCUPATIONAL_HEALTH_ROUTES.foodHandlerClearances,
    { method: "POST", body: payload },
  );
}

export async function fetchSickLeaveCertificates() {
  const response = await bffRequest<ListResponse<SickLeaveCertificate>>(
    BFF_OCCUPATIONAL_HEALTH_ROUTES.sickLeaveCertificates,
  );
  return response.results;
}

export async function createSickLeaveCertificate(
  payload: Record<string, unknown>,
) {
  return bffRequest<SickLeaveCertificate>(
    BFF_OCCUPATIONAL_HEALTH_ROUTES.sickLeaveCertificates,
    { method: "POST", body: payload },
  );
}

export async function fetchOhHrFitness(employmentEpisodeUuid: string) {
  return bffRequest<OhHrFitnessRow[]>(
    `${BFF_OCCUPATIONAL_HEALTH_ROUTES.hrFitness}${listQuery({
      employment_episode: employmentEpisodeUuid,
    })}`,
  );
}

export async function fetchIodStatutoryPack(caseUuid: string) {
  return bffRequest<Record<string, unknown>>(
    BFF_OCCUPATIONAL_HEALTH_ROUTES.iodCaseStatutoryPack(caseUuid),
  );
}

export async function downloadIodStatutoryPack(caseUuid: string) {
  const data = await fetchIodStatutoryPack(caseUuid);
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const filename = `iod-statutory-pack-${caseUuid}.json`;
  return { blob, filename };
}

export async function downloadOhComplianceExtract() {
  const response = await fetch(BFF_OCCUPATIONAL_HEALTH_ROUTES.complianceExtract, {
    method: "POST",
    credentials: "include",
  });
  if (!response.ok) {
    let message = "Compliance extract failed.";
    try {
      const json = (await response.json()) as { message?: string };
      message = json.message ?? message;
    } catch {
      // ignore
    }
    throw new Error(message);
  }
  const blob = await response.blob();
  const disposition = response.headers.get("Content-Disposition") ?? "";
  const match = disposition.match(/filename="([^"]+)"/);
  const filename = match?.[1] ?? "oh-compliance.csv";
  return { blob, filename };
}
