import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  amendClinicalNote,
  amendNursingNote,
  cancelOrder,
  cancelPrescription,
  createChiefComplaint,
  createChiefComplaintHpi,
  createClinicalNote,
  createCurrentMedication,
  createEncounterAllergy,
  createEncounterObservation,
  createNursingNote,
  createOrder,
  createPhysicalExam,
  createPrescription,
  createProblemListItem,
  deleteChiefComplaint,
  fetchChiefComplaints,
  fetchChiefComplaintSuggestions,
  fetchClinicalNotes,
  fetchCurrentMedications,
  fetchEncounterAllergies,
  fetchEncounterChartSummary,
  fetchEncounterClinicalHistory,
  fetchEncounterDisposition,
  fetchEncounterHistorySummary,
  fetchEncounterObservations,
  fetchEncounterTimeline,
  fetchNursingNotes,
  fetchObservationDefinitions,
  fetchOpdQueue,
  fetchOrders,
  fetchPhysicalExams,
  fetchPrescriptions,
  fetchProblemList,
  fetchRoleCapabilities,
  fetchMyClinicalCapabilities,
  finalizePrescription,
  updateChiefComplaint,
  updateChiefComplaintHpi,
  updateCurrentMedication,
  updateEncounterAllergy,
  updatePhysicalExam,
  updateProblemListItem,
  updateRoleCapabilities,
  upsertEncounterDisposition,
} from "@/features/clinical-opd/services/clinical-opd.service";
import { buildOpdEncounterTabCounts } from "@/features/clinical-opd/utils/opd-encounter-tab-counts";

export function opdQueueQueryKey(options?: {
  queueStage?: string;
  status?: string;
  clinicUuid?: string;
  search?: string;
}) {
  return [
    "opd-queue",
    options?.queueStage ?? "all",
    options?.status ?? "all",
    options?.clinicUuid ?? "all",
    options?.search ?? "",
  ] as const;
}

async function invalidateEncounterWorkspaceQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  visitUuid: string,
  encounterUuid: string,
) {
  await queryClient.invalidateQueries({
    queryKey: ["encounter-timeline", visitUuid, encounterUuid],
  });
  await queryClient.invalidateQueries({
    queryKey: ["encounter-chart-summary", visitUuid, encounterUuid],
  });
  await queryClient.invalidateQueries({ queryKey: ["opd-queue"] });
}

export function useOpdQueue(options?: {
  queueStage?: string;
  status?: string;
  clinicUuid?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: opdQueueQueryKey(options),
    queryFn: () =>
      fetchOpdQueue({
        queueStage: options?.queueStage,
        status: options?.status,
        clinicUuid: options?.clinicUuid,
        search: options?.search,
      }),
  });
}

export function useEncounterChartSummary(
  visitUuid: string,
  encounterUuid: string,
  enabled = true,
) {
  return useQuery({
    queryKey: ["encounter-chart-summary", visitUuid, encounterUuid],
    queryFn: () => fetchEncounterChartSummary(visitUuid, encounterUuid),
    enabled: enabled && Boolean(visitUuid && encounterUuid),
  });
}

export function useEncounterHistorySummary(
  visitUuid: string,
  encounterUuid: string,
  enabled = true,
) {
  return useQuery({
    queryKey: ["encounter-history-summary", visitUuid, encounterUuid],
    queryFn: () => fetchEncounterHistorySummary(visitUuid, encounterUuid),
    enabled: enabled && Boolean(visitUuid && encounterUuid),
  });
}

export function useObservationDefinitions() {
  return useQuery({
    queryKey: ["clinical-observation-definitions"],
    queryFn: fetchObservationDefinitions,
    staleTime: 5 * 60 * 1000,
  });
}

export function useEncounterWorkspace(
  visitUuid: string,
  encounterUuid: string,
) {
  const observations = useQuery({
    queryKey: ["encounter-observations", visitUuid, encounterUuid],
    queryFn: () => fetchEncounterObservations(visitUuid, encounterUuid),
  });
  const nursingNotes = useQuery({
    queryKey: ["encounter-nursing-notes", visitUuid, encounterUuid],
    queryFn: () => fetchNursingNotes(visitUuid, encounterUuid),
  });
  const physicalExams = useQuery({
    queryKey: ["encounter-physical-exams", visitUuid, encounterUuid],
    queryFn: () => fetchPhysicalExams(visitUuid, encounterUuid),
  });
  const clinicalNotes = useQuery({
    queryKey: ["encounter-clinical-notes", visitUuid, encounterUuid],
    queryFn: () => fetchClinicalNotes(visitUuid, encounterUuid),
  });
  const prescriptions = useQuery({
    queryKey: ["encounter-prescriptions", visitUuid, encounterUuid],
    queryFn: () => fetchPrescriptions(visitUuid, encounterUuid),
  });
  const orders = useQuery({
    queryKey: ["encounter-orders", visitUuid, encounterUuid],
    queryFn: () => fetchOrders(visitUuid, encounterUuid),
  });
  const timeline = useQuery({
    queryKey: ["encounter-timeline", visitUuid, encounterUuid],
    queryFn: () => fetchEncounterTimeline(visitUuid, encounterUuid),
  });

  return {
    observations,
    nursingNotes,
    physicalExams,
    clinicalNotes,
    prescriptions,
    orders,
    timeline,
  };
}

/** Record counts rendered next to the encounter tab labels. */
export function useOpdEncounterTabCounts(
  visitUuid: string,
  encounterUuid: string,
) {
  const { observations, orders, prescriptions } = useEncounterWorkspace(
    visitUuid,
    encounterUuid,
  );

  return buildOpdEncounterTabCounts({
    observations: observations.data,
    orders: orders.data,
    prescriptions: prescriptions.data,
  });
}

export function useCreateObservation(visitUuid: string, encounterUuid: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      createEncounterObservation(visitUuid, encounterUuid, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["encounter-observations", visitUuid, encounterUuid],
      });
      await invalidateEncounterWorkspaceQueries(
        queryClient,
        visitUuid,
        encounterUuid,
      );
    },
  });
}

export function useCreateNursingNote(visitUuid: string, encounterUuid: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { body: string }) =>
      createNursingNote(visitUuid, encounterUuid, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["encounter-nursing-notes", visitUuid, encounterUuid],
      });
      await invalidateEncounterWorkspaceQueries(
        queryClient,
        visitUuid,
        encounterUuid,
      );
    },
  });
}

export function useCreatePhysicalExam(visitUuid: string, encounterUuid: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      createPhysicalExam(visitUuid, encounterUuid, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["encounter-physical-exams", visitUuid, encounterUuid],
      });
      await invalidateEncounterWorkspaceQueries(
        queryClient,
        visitUuid,
        encounterUuid,
      );
    },
  });
}

export function useUpdatePhysicalExam(visitUuid: string, encounterUuid: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      examUuid,
      payload,
    }: {
      examUuid: string;
      payload: Record<string, unknown>;
    }) => updatePhysicalExam(visitUuid, encounterUuid, examUuid, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["encounter-physical-exams", visitUuid, encounterUuid],
      });
      await invalidateEncounterWorkspaceQueries(
        queryClient,
        visitUuid,
        encounterUuid,
      );
    },
  });
}

export function useCreateClinicalNote(visitUuid: string, encounterUuid: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { body: string }) =>
      createClinicalNote(visitUuid, encounterUuid, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["encounter-clinical-notes", visitUuid, encounterUuid],
      });
      await invalidateEncounterWorkspaceQueries(
        queryClient,
        visitUuid,
        encounterUuid,
      );
    },
  });
}

export function useRoleCapabilities() {
  return useQuery({
    queryKey: ["clinical-role-capabilities"],
    queryFn: fetchRoleCapabilities,
  });
}

export function useMyClinicalCapabilities() {
  return useQuery({
    queryKey: ["clinical-my-capabilities"],
    queryFn: fetchMyClinicalCapabilities,
    staleTime: 60 * 1000,
  });
}

export function useUpdateRoleCapabilities() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateRoleCapabilities,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["clinical-role-capabilities"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["clinical-my-capabilities"],
      });
    },
  });
}

export function useCreatePrescription(visitUuid: string, encounterUuid: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      createPrescription(visitUuid, encounterUuid, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["encounter-prescriptions", visitUuid, encounterUuid],
      });
      await invalidateEncounterWorkspaceQueries(
        queryClient,
        visitUuid,
        encounterUuid,
      );
    },
  });
}

export function useFinalizePrescription(visitUuid: string, encounterUuid: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (prescriptionUuid: string) =>
      finalizePrescription(visitUuid, encounterUuid, prescriptionUuid),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["encounter-prescriptions", visitUuid, encounterUuid],
      });
      await queryClient.invalidateQueries({
        queryKey: ["encounter-orders", visitUuid, encounterUuid],
      });
      await invalidateEncounterWorkspaceQueries(
        queryClient,
        visitUuid,
        encounterUuid,
      );
    },
  });
}

export function useCancelPrescription(visitUuid: string, encounterUuid: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (prescriptionUuid: string) =>
      cancelPrescription(visitUuid, encounterUuid, prescriptionUuid),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["encounter-prescriptions", visitUuid, encounterUuid],
      });
      await queryClient.invalidateQueries({
        queryKey: ["encounter-orders", visitUuid, encounterUuid],
      });
      await invalidateEncounterWorkspaceQueries(
        queryClient,
        visitUuid,
        encounterUuid,
      );
    },
  });
}

export function useEncounterOrders(visitUuid: string, encounterUuid: string) {
  return useQuery({
    queryKey: ["encounter-orders", visitUuid, encounterUuid],
    queryFn: () => fetchOrders(visitUuid, encounterUuid),
  });
}

export function useCreateOrder(visitUuid: string, encounterUuid: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      createOrder(visitUuid, encounterUuid, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["encounter-orders", visitUuid, encounterUuid],
      });
      await invalidateEncounterWorkspaceQueries(
        queryClient,
        visitUuid,
        encounterUuid,
      );
    },
  });
}

export function useCancelOrder(visitUuid: string, encounterUuid: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderUuid: string) =>
      cancelOrder(visitUuid, encounterUuid, orderUuid),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["encounter-orders", visitUuid, encounterUuid],
      });
      await invalidateEncounterWorkspaceQueries(
        queryClient,
        visitUuid,
        encounterUuid,
      );
    },
  });
}

export function encounterClinicalHistoryQueryKey(
  visitUuid: string,
  encounterUuid: string,
  historyEncounterUuid?: string | null,
) {
  return [
    "encounter-clinical-history",
    visitUuid,
    encounterUuid,
    historyEncounterUuid ?? "latest",
  ] as const;
}

export function useEncounterClinicalHistory(
  visitUuid: string,
  encounterUuid: string,
  historyEncounterUuid?: string | null,
  enabled = true,
) {
  return useQuery({
    queryKey: encounterClinicalHistoryQueryKey(
      visitUuid,
      encounterUuid,
      historyEncounterUuid,
    ),
    queryFn: () =>
      fetchEncounterClinicalHistory(
        visitUuid,
        encounterUuid,
        historyEncounterUuid,
      ),
    enabled: enabled && Boolean(visitUuid && encounterUuid),
  });
}

export function useAmendNursingNote(visitUuid: string, encounterUuid: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      noteUuid,
      payload,
    }: {
      noteUuid: string;
      payload: { body: string; amendment_reason: string };
    }) => amendNursingNote(visitUuid, encounterUuid, noteUuid, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["encounter-nursing-notes", visitUuid, encounterUuid],
      });
      await invalidateEncounterWorkspaceQueries(
        queryClient,
        visitUuid,
        encounterUuid,
      );
    },
  });
}

export function useAmendClinicalNote(visitUuid: string, encounterUuid: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      noteUuid,
      payload,
    }: {
      noteUuid: string;
      payload: { body: string; amendment_reason: string };
    }) => amendClinicalNote(visitUuid, encounterUuid, noteUuid, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["encounter-clinical-notes", visitUuid, encounterUuid],
      });
      await invalidateEncounterWorkspaceQueries(
        queryClient,
        visitUuid,
        encounterUuid,
      );
    },
  });
}

export function useEncounterAllergies(
  visitUuid: string,
  encounterUuid: string,
  enabled = true,
) {
  return useQuery({
    queryKey: ["encounter-allergies", visitUuid, encounterUuid],
    queryFn: () => fetchEncounterAllergies(visitUuid, encounterUuid),
    enabled: enabled && Boolean(visitUuid && encounterUuid),
  });
}

export function useCreateEncounterAllergy(
  visitUuid: string,
  encounterUuid: string,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      createEncounterAllergy(visitUuid, encounterUuid, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["encounter-allergies", visitUuid, encounterUuid],
      });
      await invalidateEncounterWorkspaceQueries(
        queryClient,
        visitUuid,
        encounterUuid,
      );
    },
  });
}

export function useUpdateEncounterAllergy(
  visitUuid: string,
  encounterUuid: string,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      allergyUuid,
      payload,
    }: {
      allergyUuid: string;
      payload: Record<string, unknown>;
    }) =>
      updateEncounterAllergy(visitUuid, encounterUuid, allergyUuid, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["encounter-allergies", visitUuid, encounterUuid],
      });
      await invalidateEncounterWorkspaceQueries(
        queryClient,
        visitUuid,
        encounterUuid,
      );
    },
  });
}

export function useChiefComplaints(
  visitUuid: string,
  encounterUuid: string,
  enabled = true,
) {
  return useQuery({
    queryKey: ["encounter-chief-complaints", visitUuid, encounterUuid],
    queryFn: () => fetchChiefComplaints(visitUuid, encounterUuid),
    enabled: enabled && Boolean(visitUuid && encounterUuid),
  });
}

export function useCreateChiefComplaint(
  visitUuid: string,
  encounterUuid: string,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { text: string }) =>
      createChiefComplaint(visitUuid, encounterUuid, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["encounter-chief-complaints", visitUuid, encounterUuid],
      });
      await invalidateEncounterWorkspaceQueries(
        queryClient,
        visitUuid,
        encounterUuid,
      );
    },
  });
}

export function useUpdateChiefComplaint(
  visitUuid: string,
  encounterUuid: string,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      complaintUuid,
      text,
    }: {
      complaintUuid: string;
      text: string;
    }) =>
      updateChiefComplaint(visitUuid, encounterUuid, complaintUuid, { text }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["encounter-chief-complaints", visitUuid, encounterUuid],
      });
      await invalidateEncounterWorkspaceQueries(
        queryClient,
        visitUuid,
        encounterUuid,
      );
    },
  });
}

export function useChiefComplaintSuggestions(
  visitUuid: string,
  encounterUuid: string,
  enabled = true,
) {
  return useQuery({
    queryKey: ["encounter-chief-complaint-suggestions", visitUuid, encounterUuid],
    queryFn: () => fetchChiefComplaintSuggestions(visitUuid, encounterUuid),
    enabled: enabled && Boolean(visitUuid && encounterUuid),
    staleTime: 5 * 60 * 1000,
  });
}

export function useDeleteChiefComplaint(
  visitUuid: string,
  encounterUuid: string,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (complaintUuid: string) =>
      deleteChiefComplaint(visitUuid, encounterUuid, complaintUuid),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["encounter-chief-complaints", visitUuid, encounterUuid],
      });
      await invalidateEncounterWorkspaceQueries(
        queryClient,
        visitUuid,
        encounterUuid,
      );
    },
  });
}

export function useSaveChiefComplaintHpi(
  visitUuid: string,
  encounterUuid: string,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      complaintUuid,
      body,
      hasHpi,
    }: {
      complaintUuid: string;
      body: string;
      hasHpi: boolean;
    }) =>
      hasHpi
        ? updateChiefComplaintHpi(visitUuid, encounterUuid, complaintUuid, {
            body,
          })
        : createChiefComplaintHpi(visitUuid, encounterUuid, complaintUuid, {
            body,
          }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["encounter-chief-complaints", visitUuid, encounterUuid],
      });
      await invalidateEncounterWorkspaceQueries(
        queryClient,
        visitUuid,
        encounterUuid,
      );
    },
  });
}

export function useProblemList(
  visitUuid: string,
  encounterUuid: string,
  enabled = true,
) {
  return useQuery({
    queryKey: ["encounter-problem-list", visitUuid, encounterUuid],
    queryFn: () => fetchProblemList(visitUuid, encounterUuid),
    enabled: enabled && Boolean(visitUuid && encounterUuid),
  });
}

export function useCreateProblemListItem(
  visitUuid: string,
  encounterUuid: string,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      createProblemListItem(visitUuid, encounterUuid, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["encounter-problem-list", visitUuid, encounterUuid],
      });
      await invalidateEncounterWorkspaceQueries(
        queryClient,
        visitUuid,
        encounterUuid,
      );
    },
  });
}

export function useUpdateProblemListItem(
  visitUuid: string,
  encounterUuid: string,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      problemUuid,
      payload,
    }: {
      problemUuid: string;
      payload: Record<string, unknown>;
    }) => updateProblemListItem(visitUuid, encounterUuid, problemUuid, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["encounter-problem-list", visitUuid, encounterUuid],
      });
      await invalidateEncounterWorkspaceQueries(
        queryClient,
        visitUuid,
        encounterUuid,
      );
    },
  });
}

export function useCurrentMedications(
  visitUuid: string,
  encounterUuid: string,
  enabled = true,
) {
  return useQuery({
    queryKey: ["encounter-current-medications", visitUuid, encounterUuid],
    queryFn: () => fetchCurrentMedications(visitUuid, encounterUuid),
    enabled: enabled && Boolean(visitUuid && encounterUuid),
  });
}

export function useCreateCurrentMedication(
  visitUuid: string,
  encounterUuid: string,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      createCurrentMedication(visitUuid, encounterUuid, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["encounter-current-medications", visitUuid, encounterUuid],
      });
      await invalidateEncounterWorkspaceQueries(
        queryClient,
        visitUuid,
        encounterUuid,
      );
    },
  });
}

export function useUpdateCurrentMedication(
  visitUuid: string,
  encounterUuid: string,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      medicationUuid,
      payload,
    }: {
      medicationUuid: string;
      payload: Record<string, unknown>;
    }) =>
      updateCurrentMedication(
        visitUuid,
        encounterUuid,
        medicationUuid,
        payload,
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["encounter-current-medications", visitUuid, encounterUuid],
      });
      await invalidateEncounterWorkspaceQueries(
        queryClient,
        visitUuid,
        encounterUuid,
      );
    },
  });
}

export function useEncounterDisposition(
  visitUuid: string,
  encounterUuid: string,
  enabled = true,
) {
  return useQuery({
    queryKey: ["encounter-disposition", visitUuid, encounterUuid],
    queryFn: () => fetchEncounterDisposition(visitUuid, encounterUuid),
    enabled: enabled && Boolean(visitUuid && encounterUuid),
  });
}

export function useUpsertEncounterDisposition(
  visitUuid: string,
  encounterUuid: string,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      upsertEncounterDisposition(visitUuid, encounterUuid, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["encounter-disposition", visitUuid, encounterUuid],
      });
      await invalidateEncounterWorkspaceQueries(
        queryClient,
        visitUuid,
        encounterUuid,
      );
    },
  });
}
