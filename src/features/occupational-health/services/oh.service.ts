import { BFF_OCCUPATIONAL_HEALTH_ROUTES } from "@/constants/api";
import type {
  EmploymentEpisode,
  FitnessAssessment,
  FitnessCertificate,
  FoodHandlerClearance,
  IodCase,
  OhCampaignQueueRow,
  OhCatalogItem,
  OhCatalogItemAttributes,
  OhCatalogItemType,
  OhCatalogScheduleRow,
  OhCatalogSection,
  OhCatalogSectionRule,
  OhCatalogSelectionMode,
  OhCofTemplate,
  OhCofTemplateSection,
  OhComplianceDashboard,
  OhExamSection,
  OhExamSectionItem,
  OhExamTemplate,
  OhExamTemplateSection,
  OhEmployer,
  OhEmployerDepartment,
  OhEmployerSite,
  OhExamFinding,
  OhExamination,
  OhFitnessValidityAlert,
  OhFeatureFlag,
  OhHazard,
  OhHazardProfile,
  OhHrFitnessRow,
  OhImmunisation,
  OhJobProfile,
  OhJobTitle,
  OhPaginatedList,
  OhProcedureRecord,
  OhProgramme,
  OhProgrammeVersion,
  OhPublishedFormConfig,
  OhRequirementsConfig,
  OhVisitEncounter,
  OhVisitHistory,
  PpeFitTest,
  SickLeaveCertificate,
  SurveillanceRequirement,
} from "@/features/occupational-health/types";
import { bffRequest } from "@/lib/bff-client";

type ListResponse<T> = OhPaginatedList<T>;

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

export async function fetchOhEmployersPage(options?: {
  page?: number;
  pageSize?: number;
}) {
  return bffRequest<ListResponse<OhEmployer>>(
    `${BFF_OCCUPATIONAL_HEALTH_ROUTES.employers}${listQuery({
      page: String(options?.page ?? 1),
      page_size: String(options?.pageSize ?? 10),
    })}`,
  );
}

export async function fetchOhEmployers() {
  const response = await fetchOhEmployersPage({ page: 1, pageSize: 100 });
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

export async function updateOhEmployer(
  uuid: string,
  payload: {
    name?: string;
    code?: string;
    registration_number?: string;
  },
) {
  return bffRequest<OhEmployer>(BFF_OCCUPATIONAL_HEALTH_ROUTES.employer(uuid), {
    method: "PATCH",
    body: payload,
  });
}

export async function archiveOhEmployer(uuid: string) {
  return bffRequest<null>(BFF_OCCUPATIONAL_HEALTH_ROUTES.employer(uuid), {
    method: "DELETE",
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
  hazard_profile?: number | null;
}) {
  return bffRequest<OhJobTitle>(BFF_OCCUPATIONAL_HEALTH_ROUTES.jobTitles, {
    method: "POST",
    body: payload,
  });
}

export async function updateOhJobTitle(
  uuid: string,
  payload: {
    title?: string;
    code?: string;
    employer?: number;
    hazard_profile?: number | null;
  },
) {
  return bffRequest<OhJobTitle>(BFF_OCCUPATIONAL_HEALTH_ROUTES.jobTitle(uuid), {
    method: "PATCH",
    body: payload,
  });
}

export async function archiveOhJobTitle(uuid: string) {
  return bffRequest<null>(BFF_OCCUPATIONAL_HEALTH_ROUTES.jobTitle(uuid), {
    method: "DELETE",
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

export async function updateOhEmployerSite(
  uuid: string,
  payload: {
    name?: string;
    code?: string;
    address?: string;
    employer?: number;
  },
) {
  return bffRequest<OhEmployerSite>(
    BFF_OCCUPATIONAL_HEALTH_ROUTES.employerSite(uuid),
    { method: "PATCH", body: payload },
  );
}

export async function archiveOhEmployerSite(uuid: string) {
  return bffRequest<null>(BFF_OCCUPATIONAL_HEALTH_ROUTES.employerSite(uuid), {
    method: "DELETE",
  });
}

export async function fetchOhEmployerDepartments(employerId?: number) {
  const response = await bffRequest<ListResponse<OhEmployerDepartment>>(
    `${BFF_OCCUPATIONAL_HEALTH_ROUTES.employerDepartments}${listQuery({
      employer: employerId ? String(employerId) : undefined,
    })}`,
  );
  return response.results;
}

export async function createOhEmployerDepartment(payload: {
  name: string;
  code?: string;
  employer: number;
}) {
  return bffRequest<OhEmployerDepartment>(
    BFF_OCCUPATIONAL_HEALTH_ROUTES.employerDepartments,
    { method: "POST", body: payload },
  );
}

export async function updateOhEmployerDepartment(
  uuid: string,
  payload: {
    name?: string;
    code?: string;
    employer?: number;
  },
) {
  return bffRequest<OhEmployerDepartment>(
    BFF_OCCUPATIONAL_HEALTH_ROUTES.employerDepartment(uuid),
    { method: "PATCH", body: payload },
  );
}

export async function archiveOhEmployerDepartment(uuid: string) {
  return bffRequest<null>(
    BFF_OCCUPATIONAL_HEALTH_ROUTES.employerDepartment(uuid),
    { method: "DELETE" },
  );
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

export async function fetchOhHazardProfiles(employerId?: number) {
  const response = await bffRequest<ListResponse<OhHazardProfile>>(
    `${BFF_OCCUPATIONAL_HEALTH_ROUTES.hazardProfiles}${listQuery({
      employer: employerId ? String(employerId) : undefined,
    })}`,
  );
  return response.results;
}

export async function updateOhHazardProfile(
  uuid: string,
  payload: {
    name?: string;
    code?: string;
    employer?: number | null;
    hazards?: number[];
    cof_template?: string | null;
    exam_template?: string | null;
  },
) {
  return bffRequest<OhHazardProfile>(
    BFF_OCCUPATIONAL_HEALTH_ROUTES.hazardProfile(uuid),
    { method: "PATCH", body: payload },
  );
}

export async function archiveOhHazardProfile(uuid: string) {
  return bffRequest<null>(BFF_OCCUPATIONAL_HEALTH_ROUTES.hazardProfile(uuid), {
    method: "DELETE",
  });
}

export async function fetchOhJobProfiles(employerId?: number) {
  const response = await bffRequest<ListResponse<OhJobProfile>>(
    `${BFF_OCCUPATIONAL_HEALTH_ROUTES.jobProfiles}${listQuery({
      employer: employerId ? String(employerId) : undefined,
    })}`,
  );
  return response.results;
}

export async function createOhJobProfile(payload: {
  name: string;
  code: string;
  employer?: number | null;
  hazards?: number[];
  critical_activities?: number[];
}) {
  return bffRequest<OhJobProfile>(BFF_OCCUPATIONAL_HEALTH_ROUTES.jobProfiles, {
    method: "POST",
    body: payload,
  });
}

export async function updateOhJobProfile(
  uuid: string,
  payload: {
    name?: string;
    code?: string;
    employer?: number | null;
    hazards?: number[];
    critical_activities?: number[];
  },
) {
  return bffRequest<OhJobProfile>(
    BFF_OCCUPATIONAL_HEALTH_ROUTES.jobProfile(uuid),
    { method: "PATCH", body: payload },
  );
}

export async function archiveOhJobProfile(uuid: string) {
  return bffRequest<null>(BFF_OCCUPATIONAL_HEALTH_ROUTES.jobProfile(uuid), {
    method: "DELETE",
  });
}

export async function createOhHazardProfile(payload: {
  name: string;
  code?: string;
  employer?: number | null;
  hazards?: number[];
  cof_template?: string | null;
  exam_template?: string | null;
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

export async function fetchOhExamination(uuid: string) {
  return bffRequest<OhExamination>(
    BFF_OCCUPATIONAL_HEALTH_ROUTES.examination(uuid),
  );
}

export async function patchOhExaminationResponses(
  uuid: string,
  payload: { responses_json: Record<string, unknown>; row_version: number },
) {
  return bffRequest<OhExamination>(
    BFF_OCCUPATIONAL_HEALTH_ROUTES.examinationResponses(uuid),
    { method: "PATCH", body: payload },
  );
}

export async function fetchOhPublishedFormConfig() {
  return bffRequest<OhPublishedFormConfig>(
    BFF_OCCUPATIONAL_HEALTH_ROUTES.publishedFormConfig,
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

export async function fetchOhVisitHistory(
  visitUuid: string,
  encounterUuid: string,
  historyEncounterUuid?: string | null,
) {
  return bffRequest<OhVisitHistory>(
    `${BFF_OCCUPATIONAL_HEALTH_ROUTES.encounterHistory(visitUuid, encounterUuid)}${listQuery(
      {
        history_encounter_uuid: historyEncounterUuid ?? undefined,
      },
    )}`,
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

export async function fetchOhFeatureFlags() {
  const response = await bffRequest<ListResponse<OhFeatureFlag>>(
    BFF_OCCUPATIONAL_HEALTH_ROUTES.featureFlags,
  );
  return response.results;
}

export async function enableOhConfigurableProgrammes() {
  const programmes = await bffRequest<OhFeatureFlag>(
    BFF_OCCUPATIONAL_HEALTH_ROUTES.featureFlags,
    {
      method: "POST",
      body: {
        key: "ohs.configurable.programmes",
        enabled: true,
      },
    },
  );
  // Schema exam runtime still checks this flag; enable with programmes so
  // settings no longer exposes a separate Form engine control.
  try {
    await bffRequest<OhFeatureFlag>(BFF_OCCUPATIONAL_HEALTH_ROUTES.featureFlags, {
      method: "POST",
      body: {
        key: "ohs.form_engine",
        enabled: true,
      },
    });
  } catch {
    // Programmes flag is the primary gate; form engine may already be on.
  }
  return programmes;
}

export async function fetchOhProgrammes(employerId?: number) {
  const response = await bffRequest<ListResponse<OhProgramme>>(
    `${BFF_OCCUPATIONAL_HEALTH_ROUTES.programmes}${listQuery({
      employer: employerId ? String(employerId) : undefined,
    })}`,
  );
  return response.results;
}

export async function createOhProgramme(payload: {
  name: string;
  code: string;
  employer?: number | null;
}) {
  return bffRequest<OhProgramme>(BFF_OCCUPATIONAL_HEALTH_ROUTES.programmes, {
    method: "POST",
    body: payload,
  });
}

export async function createOhProgrammeVersion(
  programmeUuid: string,
  payload?: { config_json?: Record<string, unknown> },
) {
  return bffRequest<OhProgrammeVersion>(
    BFF_OCCUPATIONAL_HEALTH_ROUTES.programmeVersions(programmeUuid),
    {
      method: "POST",
      body: payload ?? {},
    },
  );
}

export async function publishOhProgrammeVersion(versionUuid: string) {
  return bffRequest<OhProgrammeVersion>(
    BFF_OCCUPATIONAL_HEALTH_ROUTES.programmeVersionPublish(versionUuid),
    { method: "POST", body: {} },
  );
}

export async function fetchOhProgrammeVersion(versionUuid: string) {
  return bffRequest<OhProgrammeVersion>(
    BFF_OCCUPATIONAL_HEALTH_ROUTES.programmeVersion(versionUuid),
  );
}

export async function updateOhProgrammeVersion(
  versionUuid: string,
  payload: { config_json?: Record<string, unknown> },
) {
  return bffRequest<OhProgrammeVersion>(
    BFF_OCCUPATIONAL_HEALTH_ROUTES.programmeVersion(versionUuid),
    { method: "PATCH", body: payload },
  );
}

export async function fetchOhExaminationProcedures(examUuid: string) {
  return bffRequest<{
    results: OhProcedureRecord[];
    checklist_complete: boolean;
  }>(BFF_OCCUPATIONAL_HEALTH_ROUTES.examinationProcedures(examUuid));
}

export async function patchOhExaminationProcedure(
  examUuid: string,
  recordUuid: string,
  payload: {
    status: string;
    notes?: string;
    abnormal?: boolean;
    performed_at?: string | null;
  },
) {
  return bffRequest<{
    record: OhProcedureRecord;
    checklist_complete: boolean;
  }>(BFF_OCCUPATIONAL_HEALTH_ROUTES.examinationProcedure(examUuid, recordUuid), {
    method: "PATCH",
    body: payload,
  });
}

export async function fetchOhCatalogItemsPage(options?: {
  page?: number;
  pageSize?: number;
  itemType?: OhCatalogItemType;
  sectionUuid?: string;
  search?: string;
}) {
  return bffRequest<ListResponse<OhCatalogItem>>(
    `${BFF_OCCUPATIONAL_HEALTH_ROUTES.catalogItems}${listQuery({
      page: String(options?.page ?? 1),
      page_size: String(options?.pageSize ?? 10),
      item_type: options?.itemType ? String(options.itemType) : undefined,
      section: options?.sectionUuid || undefined,
      search: options?.search?.trim() || undefined,
    })}`,
  );
}

export async function fetchOhCatalogItems(options?: {
  itemType?: OhCatalogItemType;
  sectionUuid?: string;
  pageSize?: number;
  search?: string;
}) {
  const response = await fetchOhCatalogItemsPage({
    page: 1,
    pageSize: options?.pageSize ?? 100,
    itemType: options?.itemType,
    sectionUuid: options?.sectionUuid,
    search: options?.search,
  });
  return response.results;
}

export async function createOhCatalogItem(payload: {
  section: string;
  code: string;
  names_i18n?: Record<string, string>;
  attributes_json?: Record<string, unknown>;
  active?: boolean;
  /** @deprecated Derived from section on the server. */
  item_type?: OhCatalogItemType;
}) {
  return bffRequest<OhCatalogItem>(BFF_OCCUPATIONAL_HEALTH_ROUTES.catalogItems, {
    method: "POST",
    body: payload,
  });
}

export async function updateOhCatalogItem(
  uuid: string,
  payload: {
    section?: string;
    code?: string;
    names_i18n?: Record<string, string>;
    attributes_json?: Record<string, unknown>;
    active?: boolean;
  },
) {
  return bffRequest<OhCatalogItem>(
    BFF_OCCUPATIONAL_HEALTH_ROUTES.catalogItem(uuid),
    { method: "PATCH", body: payload },
  );
}

export async function archiveOhCatalogItem(uuid: string) {
  return bffRequest<null>(BFF_OCCUPATIONAL_HEALTH_ROUTES.catalogItem(uuid), {
    method: "DELETE",
  });
}

export function ohCatalogItemLabel(item: OhCatalogItem): string {
  const en = item.names_i18n?.en?.trim();
  if (en) {
    return en;
  }
  const first = Object.values(item.names_i18n ?? {}).find(
    (value) => typeof value === "string" && value.trim(),
  );
  return first?.trim() || item.code;
}

type CatalogAttributesSource = {
  attributes_json?: OhCatalogItemAttributes | null;
} | null | undefined;

export function getCatalogPossibleResponses(
  item: CatalogAttributesSource,
): Array<{ code: string; label: string }> {
  const raw = item?.attributes_json?.possible_responses;
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw
    .filter(
      (entry): entry is { code: string; label: string } =>
        Boolean(
          entry &&
            typeof entry === "object" &&
            typeof (entry as { code?: unknown }).code === "string" &&
            typeof (entry as { label?: unknown }).label === "string",
        ),
    )
    .map((entry) => ({
      code: entry.code.trim(),
      label: entry.label.trim() || entry.code.trim(),
    }))
    .filter((entry) => entry.code);
}

export function getCatalogSelectionMode(
  item: OhCatalogItem | null | undefined,
  section?: OhCatalogSection | null,
): OhCatalogSelectionMode {
  if (section?.selection_mode === "exclusive") {
    return "exclusive";
  }
  if (section?.selection_mode === "inclusive") {
    return "inclusive";
  }
  // Legacy fallback from item attributes.
  return item?.attributes_json?.selection_mode === "exclusive"
    ? "exclusive"
    : "inclusive";
}

export function getSectionSelectionMode(
  section:
    | { selection_mode?: OhCatalogSelectionMode | string }
    | null
    | undefined,
): OhCatalogSelectionMode {
  return section?.selection_mode === "exclusive" ? "exclusive" : "inclusive";
}

export function getCatalogItemMandatory(
  item: CatalogAttributesSource,
): boolean {
  return Boolean(item?.attributes_json?.is_mandatory);
}

const SCHEDULE_UNITS = new Set(["day", "week", "month", "year"]);

export function formatCatalogScheduleSummary(
  row: OhCatalogScheduleRow | null | undefined,
): string | null {
  if (!row) {
    return null;
  }
  const interval = Math.max(1, Math.floor(Number(row.interval) || 0));
  if (!interval) {
    return null;
  }
  const unit = row.unit || "month";
  const unitLabel =
    unit === "day"
      ? interval === 1
        ? "day"
        : "days"
      : unit === "week"
        ? interval === 1
          ? "week"
          : "weeks"
        : unit === "year"
          ? interval === 1
            ? "year"
            : "years"
          : interval === 1
            ? "month"
            : "months";
  return `Every ${interval} ${unitLabel}`;
}

export function getCatalogSchedule(
  item: CatalogAttributesSource,
): OhCatalogScheduleRow[] {
  const raw = item?.attributes_json?.schedule;
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw
    .map((entry) => {
      if (!entry || typeof entry !== "object") {
        return null;
      }
      const record = entry as {
        interval?: unknown;
        interval_months?: unknown;
        unit?: unknown;
        notes?: unknown;
      };
      const interval = Number(
        record.interval ?? record.interval_months ?? NaN,
      );
      if (!Number.isFinite(interval) || interval < 1) {
        return null;
      }
      const rawUnit = typeof record.unit === "string" ? record.unit : "month";
      const unit = SCHEDULE_UNITS.has(rawUnit)
        ? (rawUnit as OhCatalogScheduleRow["unit"])
        : "month";
      const notes = record.notes;
      return {
        interval: Math.floor(interval),
        unit,
        notes: typeof notes === "string" ? notes : "",
      };
    })
    .filter((entry): entry is OhCatalogScheduleRow => entry != null);
}

export async function fetchOhCatalogSections() {
  const response = await bffRequest<ListResponse<OhCatalogSection>>(
    BFF_OCCUPATIONAL_HEALTH_ROUTES.catalogSectionRules,
  );
  return response.results;
}

/** @deprecated Use fetchOhCatalogSections */
export async function fetchOhCatalogSectionRules() {
  return fetchOhCatalogSections();
}

export async function createOhCatalogSection(payload: {
  code: string;
  name: string;
  is_mandatory?: boolean;
  selection_mode?: OhCatalogSelectionMode;
  sort_order?: number;
}) {
  return bffRequest<OhCatalogSection>(
    BFF_OCCUPATIONAL_HEALTH_ROUTES.catalogSectionRules,
    { method: "POST", body: payload },
  );
}

export async function updateOhCatalogSection(
  uuid: string,
  payload: {
    name?: string;
    is_mandatory?: boolean;
    selection_mode?: OhCatalogSelectionMode;
    sort_order?: number;
    active?: boolean;
  },
) {
  return bffRequest<OhCatalogSection>(
    BFF_OCCUPATIONAL_HEALTH_ROUTES.catalogSectionRule(uuid),
    { method: "PATCH", body: payload },
  );
}

/** @deprecated Use updateOhCatalogSection */
export async function updateOhCatalogSectionRule(
  uuid: string,
  payload: { is_mandatory: boolean; name?: string },
) {
  return updateOhCatalogSection(uuid, payload);
}

export async function archiveOhCatalogSection(uuid: string) {
  return bffRequest<null>(
    BFF_OCCUPATIONAL_HEALTH_ROUTES.catalogSectionRule(uuid),
    { method: "DELETE" },
  );
}

export function ohCatalogSectionIsSystem(section: OhCatalogSection): boolean {
  return Boolean(section.is_system || (section.system_role || "").trim());
}

export async function fetchOhCofTemplates() {
  const response = await bffRequest<ListResponse<OhCofTemplate>>(
    BFF_OCCUPATIONAL_HEALTH_ROUTES.cofTemplates,
  );
  return response.results;
}

export async function createOhCofTemplate(payload: {
  name: string;
  code: string;
}) {
  return bffRequest<OhCofTemplate>(BFF_OCCUPATIONAL_HEALTH_ROUTES.cofTemplates, {
    method: "POST",
    body: payload,
  });
}

export async function updateOhCofTemplate(
  uuid: string,
  payload: { name?: string; active?: boolean },
) {
  return bffRequest<OhCofTemplate>(
    BFF_OCCUPATIONAL_HEALTH_ROUTES.cofTemplate(uuid),
    { method: "PATCH", body: payload },
  );
}

export async function archiveOhCofTemplate(uuid: string) {
  return bffRequest<null>(BFF_OCCUPATIONAL_HEALTH_ROUTES.cofTemplate(uuid), {
    method: "DELETE",
  });
}

export async function fetchOhCofTemplateSections(templateUuid: string) {
  const response = await bffRequest<ListResponse<OhCofTemplateSection>>(
    `${BFF_OCCUPATIONAL_HEALTH_ROUTES.cofTemplateSections}${listQuery({
      template: templateUuid,
    })}`,
  );
  return response.results;
}

export async function attachOhCofTemplateSection(payload: {
  template: string;
  catalog_section: string;
  sort_order?: number;
}) {
  return bffRequest<OhCofTemplateSection>(
    BFF_OCCUPATIONAL_HEALTH_ROUTES.cofTemplateSections,
    { method: "POST", body: payload },
  );
}

export async function updateOhCofTemplateSection(
  uuid: string,
  payload: { sort_order?: number; active?: boolean },
) {
  return bffRequest<OhCofTemplateSection>(
    BFF_OCCUPATIONAL_HEALTH_ROUTES.cofTemplateSection(uuid),
    { method: "PATCH", body: payload },
  );
}

export async function detachOhCofTemplateSection(uuid: string) {
  return bffRequest<null>(
    BFF_OCCUPATIONAL_HEALTH_ROUTES.cofTemplateSection(uuid),
    { method: "DELETE" },
  );
}

export async function fetchOhExamSections() {
  const response = await bffRequest<ListResponse<OhExamSection>>(
    BFF_OCCUPATIONAL_HEALTH_ROUTES.examSections,
  );
  return response.results;
}

export async function createOhExamSection(payload: {
  code: string;
  name: string;
  is_mandatory?: boolean;
  selection_mode?: OhCatalogSelectionMode;
  sort_order?: number;
}) {
  return bffRequest<OhExamSection>(BFF_OCCUPATIONAL_HEALTH_ROUTES.examSections, {
    method: "POST",
    body: payload,
  });
}

export async function updateOhExamSection(
  uuid: string,
  payload: {
    name?: string;
    is_mandatory?: boolean;
    selection_mode?: OhCatalogSelectionMode;
    sort_order?: number;
    active?: boolean;
  },
) {
  return bffRequest<OhExamSection>(
    BFF_OCCUPATIONAL_HEALTH_ROUTES.examSection(uuid),
    { method: "PATCH", body: payload },
  );
}

export async function archiveOhExamSection(uuid: string) {
  return bffRequest<null>(BFF_OCCUPATIONAL_HEALTH_ROUTES.examSection(uuid), {
    method: "DELETE",
  });
}

export async function fetchOhExamSectionItemsPage(options: {
  sectionUuid: string;
  page?: number;
  pageSize?: number;
  search?: string;
}) {
  return bffRequest<ListResponse<OhExamSectionItem>>(
    `${BFF_OCCUPATIONAL_HEALTH_ROUTES.examSectionItems}${listQuery({
      section: options.sectionUuid,
      page: String(options.page ?? 1),
      page_size: String(options.pageSize ?? 10),
      search: options.search?.trim() || undefined,
    })}`,
  );
}

export async function createOhExamSectionItem(payload: {
  section: string;
  code: string;
  names_i18n?: Record<string, string>;
  attributes_json?: Record<string, unknown>;
  sort_order?: number;
  active?: boolean;
}) {
  return bffRequest<OhExamSectionItem>(
    BFF_OCCUPATIONAL_HEALTH_ROUTES.examSectionItems,
    { method: "POST", body: payload },
  );
}

export async function updateOhExamSectionItem(
  uuid: string,
  payload: {
    code?: string;
    names_i18n?: Record<string, string>;
    attributes_json?: Record<string, unknown>;
    sort_order?: number;
    active?: boolean;
  },
) {
  return bffRequest<OhExamSectionItem>(
    BFF_OCCUPATIONAL_HEALTH_ROUTES.examSectionItem(uuid),
    { method: "PATCH", body: payload },
  );
}

export async function archiveOhExamSectionItem(uuid: string) {
  return bffRequest<null>(
    BFF_OCCUPATIONAL_HEALTH_ROUTES.examSectionItem(uuid),
    { method: "DELETE" },
  );
}

export function ohExamSectionItemLabel(item: OhExamSectionItem): string {
  const en = item.names_i18n?.en?.trim();
  if (en) {
    return en;
  }
  const first = Object.values(item.names_i18n ?? {}).find(
    (value) => typeof value === "string" && value.trim(),
  );
  return first?.trim() || item.code;
}

export async function fetchOhExamTemplates() {
  const response = await bffRequest<ListResponse<OhExamTemplate>>(
    BFF_OCCUPATIONAL_HEALTH_ROUTES.examTemplates,
  );
  return response.results;
}

export async function createOhExamTemplate(payload: {
  name: string;
  code: string;
}) {
  return bffRequest<OhExamTemplate>(
    BFF_OCCUPATIONAL_HEALTH_ROUTES.examTemplates,
    { method: "POST", body: payload },
  );
}

export async function updateOhExamTemplate(
  uuid: string,
  payload: { name?: string; active?: boolean },
) {
  return bffRequest<OhExamTemplate>(
    BFF_OCCUPATIONAL_HEALTH_ROUTES.examTemplate(uuid),
    { method: "PATCH", body: payload },
  );
}

export async function archiveOhExamTemplate(uuid: string) {
  return bffRequest<null>(BFF_OCCUPATIONAL_HEALTH_ROUTES.examTemplate(uuid), {
    method: "DELETE",
  });
}

export async function fetchOhExamTemplateSections(templateUuid: string) {
  const response = await bffRequest<ListResponse<OhExamTemplateSection>>(
    `${BFF_OCCUPATIONAL_HEALTH_ROUTES.examTemplateSections}${listQuery({
      template: templateUuid,
    })}`,
  );
  return response.results;
}

export async function attachOhExamTemplateSection(payload: {
  template: string;
  exam_section: string;
  sort_order?: number;
}) {
  return bffRequest<OhExamTemplateSection>(
    BFF_OCCUPATIONAL_HEALTH_ROUTES.examTemplateSections,
    { method: "POST", body: payload },
  );
}

export async function detachOhExamTemplateSection(uuid: string) {
  return bffRequest<null>(
    BFF_OCCUPATIONAL_HEALTH_ROUTES.examTemplateSection(uuid),
    { method: "DELETE" },
  );
}

export type { OhRequirementsConfig };
