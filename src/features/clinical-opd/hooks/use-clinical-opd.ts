import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  cancelOrder,
  cancelPrescription,
  createClinicalNote,
  createEncounterObservation,
  createNursingNote,
  createOrder,
  createPhysicalExam,
  createPrescription,
  fetchClinicalNotes,
  fetchEncounterClinicalHistory,
  fetchEncounterObservations,
  fetchEncounterTimeline,
  fetchNursingNotes,
  fetchObservationDefinitions,
  fetchOpdQueue,
  fetchOrders,
  fetchPhysicalExams,
  fetchPrescriptions,
  fetchRoleCapabilities,
  fetchMyClinicalCapabilities,
  finalizePrescription,
  updatePhysicalExam,
  updateRoleCapabilities,
} from "@/features/clinical-opd/services/clinical-opd.service";

export function opdQueueQueryKey(status?: string, clinicUuid?: string) {
  return ["opd-queue", status ?? "all", clinicUuid ?? "all"] as const;
}

async function invalidateEncounterWorkspaceQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  visitUuid: string,
  encounterUuid: string,
) {
  await queryClient.invalidateQueries({
    queryKey: ["encounter-timeline", visitUuid, encounterUuid],
  });
  await queryClient.invalidateQueries({ queryKey: ["opd-queue"] });
}

export function useOpdQueue(status?: string, clinicUuid?: string) {
  return useQuery({
    queryKey: opdQueueQueryKey(status, clinicUuid),
    queryFn: () => fetchOpdQueue({ status, clinicUuid }),
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
