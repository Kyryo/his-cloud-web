import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  addDentalPlanItem,
  createDentalFinding,
  createDentalTreatmentPlan,
  deleteDentalFinding,
  fetchDentalChart,
  fetchDentalHistory,
  fetchDentalHistorySections,
  deleteDentalProcedure,
  fetchDentalProcedures,
  fetchDentalToothHistory,
  fetchDentalTreatmentPlans,
  performDentalPlanItem,
  performDentalProcedure,
  updateDentalFinding,
  updateDentalPlanItem,
  updateDentalProcedure,
  updateDentalTreatmentPlan,
} from "@/features/clinical-dental/services/clinical-dental.service";
import type {
  DentalFindingPayload,
  DentalFindingUpdatePayload,
  DentalPerformPayload,
  DentalPlanItemPayload,
  DentalPlanItemUpdatePayload,
  DentalPlanUpdatePayload,
  DentalProcedurePayload,
  DentalProcedureUpdatePayload,
  DentalTreatmentPlanPayload,
} from "@/features/clinical-dental/types/clinical-dental.types";

export const dentalQueryKeys = {
  root: (visitUuid: string, encounterUuid: string) =>
    ["dental", visitUuid, encounterUuid] as const,
  chart: (visitUuid: string, encounterUuid: string) =>
    ["dental", visitUuid, encounterUuid, "chart"] as const,
  toothHistory: (visitUuid: string, encounterUuid: string, tooth: number) =>
    ["dental", visitUuid, encounterUuid, "tooth-history", tooth] as const,
  procedures: (visitUuid: string, encounterUuid: string) =>
    ["dental", visitUuid, encounterUuid, "procedures"] as const,
  plans: (visitUuid: string, encounterUuid: string) =>
    ["dental", visitUuid, encounterUuid, "plans"] as const,
  history: (visitUuid: string, encounterUuid: string) =>
    ["dental", visitUuid, encounterUuid, "history"] as const,
  historySections: (
    visitUuid: string,
    encounterUuid: string,
    historyEncounterUuid: string | null,
  ) =>
    [
      "dental",
      visitUuid,
      encounterUuid,
      "history-sections",
      historyEncounterUuid ?? "latest",
    ] as const,
};

function useInvalidateDental(visitUuid: string, encounterUuid: string) {
  const queryClient = useQueryClient();
  return async (options: { billing?: boolean } = {}) => {
    await queryClient.invalidateQueries({
      queryKey: dentalQueryKeys.root(visitUuid, encounterUuid),
    });
    await queryClient.invalidateQueries({
      queryKey: ["encounter-timeline", visitUuid, encounterUuid],
    });
    if (options.billing) {
      // Performed procedures add sales order lines and procedure orders.
      await queryClient.invalidateQueries({
        queryKey: ["encounter-orders", visitUuid, encounterUuid],
      });
      await queryClient.invalidateQueries({
        queryKey: ["encounter-chart-summary", visitUuid, encounterUuid],
      });
    }
  };
}

export function useDentalChart(visitUuid: string, encounterUuid: string) {
  return useQuery({
    queryKey: dentalQueryKeys.chart(visitUuid, encounterUuid),
    queryFn: () => fetchDentalChart(visitUuid, encounterUuid),
    enabled: Boolean(visitUuid && encounterUuid),
  });
}

export function useDentalToothHistory(
  visitUuid: string,
  encounterUuid: string,
  toothNumber: number | null,
) {
  return useQuery({
    queryKey: dentalQueryKeys.toothHistory(visitUuid, encounterUuid, toothNumber ?? 0),
    queryFn: () =>
      fetchDentalToothHistory(visitUuid, encounterUuid, toothNumber ?? 0),
    enabled: Boolean(visitUuid && encounterUuid && toothNumber),
  });
}

export function useDentalProcedures(visitUuid: string, encounterUuid: string) {
  return useQuery({
    queryKey: dentalQueryKeys.procedures(visitUuid, encounterUuid),
    queryFn: () => fetchDentalProcedures(visitUuid, encounterUuid),
    enabled: Boolean(visitUuid && encounterUuid),
  });
}

export function useDentalTreatmentPlans(visitUuid: string, encounterUuid: string) {
  return useQuery({
    queryKey: dentalQueryKeys.plans(visitUuid, encounterUuid),
    queryFn: () => fetchDentalTreatmentPlans(visitUuid, encounterUuid),
    enabled: Boolean(visitUuid && encounterUuid),
  });
}

export function useDentalHistory(visitUuid: string, encounterUuid: string) {
  return useQuery({
    queryKey: dentalQueryKeys.history(visitUuid, encounterUuid),
    queryFn: () => fetchDentalHistory(visitUuid, encounterUuid),
    enabled: Boolean(visitUuid && encounterUuid),
  });
}

export function useDentalHistorySections(
  visitUuid: string,
  encounterUuid: string,
  historyEncounterUuid: string | null,
) {
  return useQuery({
    queryKey: dentalQueryKeys.historySections(
      visitUuid,
      encounterUuid,
      historyEncounterUuid,
    ),
    queryFn: () =>
      fetchDentalHistorySections(visitUuid, encounterUuid, historyEncounterUuid),
    enabled: Boolean(visitUuid && encounterUuid),
  });
}

export function useCreateDentalFinding(visitUuid: string, encounterUuid: string) {
  const invalidate = useInvalidateDental(visitUuid, encounterUuid);
  return useMutation({
    mutationFn: (payload: DentalFindingPayload) =>
      createDentalFinding(visitUuid, encounterUuid, payload),
    onSuccess: () => invalidate(),
  });
}

export function useUpdateDentalFinding(visitUuid: string, encounterUuid: string) {
  const invalidate = useInvalidateDental(visitUuid, encounterUuid);
  return useMutation({
    mutationFn: ({
      findingUuid,
      payload,
    }: {
      findingUuid: string;
      payload: DentalFindingUpdatePayload;
    }) => updateDentalFinding(visitUuid, encounterUuid, findingUuid, payload),
    onSuccess: () => invalidate(),
  });
}

export function useDeleteDentalFinding(visitUuid: string, encounterUuid: string) {
  const invalidate = useInvalidateDental(visitUuid, encounterUuid);
  return useMutation({
    mutationFn: (findingUuid: string) =>
      deleteDentalFinding(visitUuid, encounterUuid, findingUuid),
    onSuccess: () => invalidate(),
  });
}

export function useCreateDentalTreatmentPlan(
  visitUuid: string,
  encounterUuid: string,
) {
  const invalidate = useInvalidateDental(visitUuid, encounterUuid);
  return useMutation({
    mutationFn: (payload: DentalTreatmentPlanPayload) =>
      createDentalTreatmentPlan(visitUuid, encounterUuid, payload),
    onSuccess: () => invalidate(),
  });
}

export function useUpdateDentalTreatmentPlan(
  visitUuid: string,
  encounterUuid: string,
) {
  const invalidate = useInvalidateDental(visitUuid, encounterUuid);
  return useMutation({
    mutationFn: ({
      planUuid,
      payload,
    }: {
      planUuid: string;
      payload: DentalPlanUpdatePayload;
    }) => updateDentalTreatmentPlan(visitUuid, encounterUuid, planUuid, payload),
    onSuccess: () => invalidate(),
  });
}

export function useAddDentalPlanItem(visitUuid: string, encounterUuid: string) {
  const invalidate = useInvalidateDental(visitUuid, encounterUuid);
  return useMutation({
    mutationFn: ({
      planUuid,
      payload,
    }: {
      planUuid: string;
      payload: DentalPlanItemPayload;
    }) => addDentalPlanItem(visitUuid, encounterUuid, planUuid, payload),
    onSuccess: () => invalidate(),
  });
}

export function useUpdateDentalPlanItem(visitUuid: string, encounterUuid: string) {
  const invalidate = useInvalidateDental(visitUuid, encounterUuid);
  return useMutation({
    mutationFn: ({
      itemUuid,
      payload,
    }: {
      itemUuid: string;
      payload: DentalPlanItemUpdatePayload;
    }) => updateDentalPlanItem(visitUuid, encounterUuid, itemUuid, payload),
    onSuccess: () => invalidate(),
  });
}

export function usePerformDentalPlanItem(visitUuid: string, encounterUuid: string) {
  const invalidate = useInvalidateDental(visitUuid, encounterUuid);
  return useMutation({
    mutationFn: ({
      itemUuid,
      payload,
    }: {
      itemUuid: string;
      payload: DentalPerformPayload;
    }) => performDentalPlanItem(visitUuid, encounterUuid, itemUuid, payload),
    onSuccess: () => invalidate({ billing: true }),
  });
}

export function usePerformDentalProcedure(visitUuid: string, encounterUuid: string) {
  const invalidate = useInvalidateDental(visitUuid, encounterUuid);
  return useMutation({
    mutationFn: (payload: DentalProcedurePayload) =>
      performDentalProcedure(visitUuid, encounterUuid, payload),
    onSuccess: () => invalidate({ billing: true }),
  });
}

export function useUpdateDentalProcedure(visitUuid: string, encounterUuid: string) {
  const invalidate = useInvalidateDental(visitUuid, encounterUuid);
  return useMutation({
    mutationFn: ({
      procedureUuid,
      payload,
    }: {
      procedureUuid: string;
      payload: DentalProcedureUpdatePayload;
    }) => updateDentalProcedure(visitUuid, encounterUuid, procedureUuid, payload),
    onSuccess: () => invalidate({ billing: true }),
  });
}

export function useDeleteDentalProcedure(visitUuid: string, encounterUuid: string) {
  const invalidate = useInvalidateDental(visitUuid, encounterUuid);
  return useMutation({
    mutationFn: (procedureUuid: string) =>
      deleteDentalProcedure(visitUuid, encounterUuid, procedureUuid),
    onSuccess: () => invalidate({ billing: true }),
  });
}
