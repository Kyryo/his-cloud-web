import { useQuery } from "@tanstack/react-query";

import {
  fetchEmploymentEpisodes,
  fetchFitnessAssessments,
  fetchFitnessCertificates,
  fetchFitnessValidityAlerts,
  fetchFoodHandlerClearances,
  fetchIodCases,
  fetchOhCampaignQueue,
  fetchOhComplianceDashboard,
  fetchOhEncounters,
  fetchOhExamFindings,
  fetchOhEmployers,
  fetchOhExaminations,
  fetchOhHrFitness,
  fetchOhJobTitles,
  fetchOhImmunisations,
  fetchOhVisitHistory,
  fetchPpeFitTests,
  fetchSickLeaveCertificates,
  fetchSurveillanceRequirements,
} from "@/features/occupational-health/services/oh.service";

export function useOhEncounters(search?: string) {
  return useQuery({
    queryKey: ["oh-encounters", search ?? ""],
    queryFn: async () => {
      const results = await fetchOhEncounters({ pageSize: 100 });
      if (!search?.trim()) {
        return results;
      }
      const normalized = search.trim().toLowerCase();
      return results.filter(
        (row) =>
          row.department_name.toLowerCase().includes(normalized) ||
          row.status.toLowerCase().includes(normalized) ||
          row.uuid.toLowerCase().includes(normalized) ||
          (row.clinician_name ?? "").toLowerCase().includes(normalized),
      );
    },
  });
}

export function useEmploymentEpisodes(customerUuid?: string) {
  return useQuery({
    queryKey: ["oh-employment-episodes", customerUuid ?? "all"],
    queryFn: () => fetchEmploymentEpisodes(customerUuid),
    enabled: Boolean(customerUuid),
  });
}

/** Resolves employer and job title ids on employment episodes to display names. */
export function useOhEmploymentLookups(enabled: boolean) {
  const employersQuery = useQuery({
    queryKey: ["oh-employers"],
    queryFn: fetchOhEmployers,
    enabled,
    staleTime: 5 * 60_000,
  });
  const jobTitlesQuery = useQuery({
    queryKey: ["oh-job-titles"],
    queryFn: () => fetchOhJobTitles(),
    enabled,
    staleTime: 5 * 60_000,
  });

  return {
    employerNames: new Map(
      (employersQuery.data ?? []).map((item) => [item.id, item.name]),
    ),
    jobTitleNames: new Map(
      (jobTitlesQuery.data ?? []).map((item) => [item.id, item.title]),
    ),
  };
}

export function useOhComplianceDashboard() {
  return useQuery({
    queryKey: ["oh-compliance-dashboard"],
    queryFn: fetchOhComplianceDashboard,
  });
}

export function useOhSurveillanceRequirements(filters?: {
  status?: string;
  site?: string;
  department?: string;
  job?: string;
  hazard?: string;
}) {
  return useQuery({
    queryKey: [
      "oh-surveillance-requirements",
      filters?.status ?? "due_or_overdue",
      filters?.site ?? "",
      filters?.department ?? "",
      filters?.job ?? "",
      filters?.hazard ?? "",
    ],
    queryFn: () =>
      fetchSurveillanceRequirements({
        status: filters?.status ?? "due_or_overdue",
        site: filters?.site || undefined,
        department: filters?.department || undefined,
        job: filters?.job || undefined,
        hazard: filters?.hazard || undefined,
      }),
  });
}

export function useOhCampaignQueue() {
  return useQuery({
    queryKey: ["oh-campaign-queue"],
    queryFn: fetchOhCampaignQueue,
  });
}

export function useOhFitnessValidityAlerts() {
  return useQuery({
    queryKey: ["oh-fitness-validity-alerts"],
    queryFn: fetchFitnessValidityAlerts,
  });
}

export function useOhHrFitness(employmentEpisodeUuid?: string) {
  return useQuery({
    queryKey: ["oh-hr-fitness", employmentEpisodeUuid ?? ""],
    queryFn: () => fetchOhHrFitness(employmentEpisodeUuid!),
    enabled: Boolean(employmentEpisodeUuid),
  });
}

export function useOhRecallsData(customerId?: number) {
  const immunisationsQuery = useQuery({
    queryKey: ["oh-immunisations"],
    queryFn: fetchOhImmunisations,
  });
  const ppeQuery = useQuery({
    queryKey: ["oh-ppe-fit-tests"],
    queryFn: fetchPpeFitTests,
  });
  const foodQuery = useQuery({
    queryKey: ["oh-food-handler-clearances"],
    queryFn: fetchFoodHandlerClearances,
  });
  const sickLeaveQuery = useQuery({
    queryKey: ["oh-sick-leave-certificates"],
    queryFn: fetchSickLeaveCertificates,
  });

  function filterByCustomer<T extends { customer: number }>(rows: T[] | undefined) {
    if (!customerId || !rows) {
      return rows ?? [];
    }
    return rows.filter((row) => row.customer === customerId);
  }

  return {
    immunisations: filterByCustomer(immunisationsQuery.data),
    ppeFitTests: filterByCustomer(ppeQuery.data),
    foodHandlerClearances: filterByCustomer(foodQuery.data),
    sickLeaveCertificates: filterByCustomer(sickLeaveQuery.data),
    isLoading:
      immunisationsQuery.isLoading ||
      ppeQuery.isLoading ||
      foodQuery.isLoading ||
      sickLeaveQuery.isLoading,
    refetchAll: () => {
      void immunisationsQuery.refetch();
      void ppeQuery.refetch();
      void foodQuery.refetch();
      void sickLeaveQuery.refetch();
    },
  };
}

export function useOhVisitHistory(
  visitUuid: string | null,
  encounterUuid: string | null,
  historyEncounterUuid?: string | null,
) {
  return useQuery({
    queryKey: [
      "oh-visit-history",
      visitUuid ?? "",
      encounterUuid ?? "",
      historyEncounterUuid ?? "",
    ],
    queryFn: () =>
      fetchOhVisitHistory(
        visitUuid!,
        encounterUuid!,
        historyEncounterUuid,
      ),
    enabled: Boolean(visitUuid && encounterUuid),
  });
}

export function useOhEncounterWorkspaceData(encounterId: number | null) {
  const examinationsQuery = useQuery({
    queryKey: ["oh-examinations"],
    queryFn: fetchOhExaminations,
  });

  const findingsQuery = useQuery({
    queryKey: ["oh-exam-findings"],
    queryFn: fetchOhExamFindings,
  });

  const fitnessQuery = useQuery({
    queryKey: ["oh-fitness-assessments"],
    queryFn: fetchFitnessAssessments,
  });

  const certificatesQuery = useQuery({
    queryKey: ["oh-fitness-certificates"],
    queryFn: fetchFitnessCertificates,
  });

  const iodQuery = useQuery({
    queryKey: ["oh-iod-cases"],
    queryFn: fetchIodCases,
  });

  const examinations =
    examinationsQuery.data?.filter((item) => item.encounter === encounterId) ??
    [];
  const examinationIds = new Set(examinations.map((item) => item.id));

  const findings =
    findingsQuery.data?.filter((item) =>
      examinationIds.has(item.examination),
    ) ?? [];

  const fitness =
    fitnessQuery.data?.filter((item) =>
      examinationIds.has(item.examination),
    ) ?? [];

  const assessmentIds = new Set(fitness.map((item) => item.id));
  const fitnessCertificates =
    certificatesQuery.data?.filter((item) =>
      assessmentIds.has(item.assessment),
    ) ?? [];

  const iodCases =
    iodQuery.data?.filter((item) => item.encounter === encounterId) ?? [];

  return {
    examinations,
    findings,
    fitness,
    fitnessCertificates,
    iodCases,
    isLoading:
      examinationsQuery.isLoading ||
      findingsQuery.isLoading ||
      fitnessQuery.isLoading ||
      certificatesQuery.isLoading ||
      iodQuery.isLoading,
    isError:
      examinationsQuery.isError ||
      findingsQuery.isError ||
      fitnessQuery.isError ||
      certificatesQuery.isError ||
      iodQuery.isError,
    refetchAll: () => {
      void examinationsQuery.refetch();
      void findingsQuery.refetch();
      void fitnessQuery.refetch();
      void certificatesQuery.refetch();
      void iodQuery.refetch();
    },
  };
}
