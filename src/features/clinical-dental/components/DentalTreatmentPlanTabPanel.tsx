"use client";

import { ClipboardList } from "lucide-react";
import { useState } from "react";

import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import {
  OpdConsultContentPanel,
  OpdConsultFormLocked,
} from "@/features/clinical-opd/components/detail/OpdConsultLayout";
import { useOpdEncounterWorkspace } from "@/features/clinical-opd/components/detail/opd-encounter-workspace-context";
import { DentalPerformDialog } from "@/features/clinical-dental/components/DentalPerformDialog";
import { DentalPlanDialog } from "@/features/clinical-dental/components/DentalPlanDialog";
import { DentalProcedureDialog } from "@/features/clinical-dental/components/DentalProcedureDialog";
import {
  useAddDentalPlanItem,
  useCreateDentalTreatmentPlan,
  useDentalProcedures,
  useDentalTreatmentPlans,
  usePerformDentalPlanItem,
  usePerformDentalProcedure,
  useUpdateDentalPlanItem,
  useUpdateDentalTreatmentPlan,
} from "@/features/clinical-dental/hooks/use-clinical-dental";
import {
  toDentalPerformPayload,
  toDentalPlanItemPayload,
  toDentalPlanPayload,
  toDentalProcedurePayload,
} from "@/features/clinical-dental/schemas/dental-plan.schema";
import type {
  DentalPlanStatus,
  DentalTreatmentPlan,
  DentalTreatmentPlanItem,
} from "@/features/clinical-dental/types/clinical-dental.types";
import {
  canPerformPlanItems,
  isPlanOpen,
  PLAN_ITEM_STATUS_LABELS,
  PLAN_STATUS_LABELS,
  planStatusActions,
} from "@/features/clinical-dental/utils/dental-plan-status";
import { formatSurfaces } from "@/features/clinical-dental/utils/dental-conditions";
import type { ClinicalWorkspacePanelProps } from "@/features/clinical-workspace/types/clinical-workspace.types";
import {
  formatDisplayDate,
  formatDisplayDateTime,
} from "@/features/customers/utils/format-customer";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage } from "@/lib/bff-field-errors";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

const STATUS_PILL_CLASS: Record<DentalPlanStatus, string> = {
  draft: "bg-slate-100 text-brand-slate",
  proposed: "bg-amber-50 text-amber-800",
  accepted: "bg-sky-50 text-sky-800",
  in_progress: "bg-brand-primary/10 text-brand-primary",
  completed: "bg-emerald-50 text-emerald-800",
  cancelled: "bg-slate-100 text-brand-muted line-through",
};

export function DentalTreatmentPlanTabPanel({
  visitUuid,
  encounterUuid,
  isActive,
}: ClinicalWorkspacePanelProps) {
  const { toast } = useToast();
  const { capabilities, isChartLocked } = useOpdEncounterWorkspace();
  const plansQuery = useDentalTreatmentPlans(visitUuid, encounterUuid);
  const proceduresQuery = useDentalProcedures(visitUuid, encounterUuid);
  const createPlan = useCreateDentalTreatmentPlan(visitUuid, encounterUuid);
  const updatePlan = useUpdateDentalTreatmentPlan(visitUuid, encounterUuid);
  const addItem = useAddDentalPlanItem(visitUuid, encounterUuid);
  const updateItem = useUpdateDentalPlanItem(visitUuid, encounterUuid);
  const performItem = usePerformDentalPlanItem(visitUuid, encounterUuid);
  const performProcedure = usePerformDentalProcedure(visitUuid, encounterUuid);

  const [isPlanDialogOpen, setIsPlanDialogOpen] = useState(false);
  const [itemPlan, setItemPlan] = useState<DentalTreatmentPlan | null>(null);
  const [isProcedureDialogOpen, setIsProcedureDialogOpen] = useState(false);
  const [performingItem, setPerformingItem] =
    useState<DentalTreatmentPlanItem | null>(null);

  const canManage = capabilities.includes("manage_treatment_plan") && !isChartLocked;
  const canPerform =
    capabilities.includes("perform_dental_procedure") && !isChartLocked;

  if (!isActive) {
    return null;
  }

  function reportError(title: string, error: unknown) {
    toast({
      variant: "error",
      title,
      description:
        error instanceof BffError
          ? formatBffErrorMessage(error.message, error.errors)
          : "Try again in a moment.",
    });
  }

  async function changePlanStatus(plan: DentalTreatmentPlan, status: DentalPlanStatus) {
    try {
      await updatePlan.mutateAsync({ planUuid: plan.uuid, payload: { status } });
      toast({ variant: "success", title: `Plan ${PLAN_STATUS_LABELS[status].toLowerCase()}` });
    } catch (error) {
      reportError("Could not update the plan", error);
    }
  }

  async function cancelItem(item: DentalTreatmentPlanItem) {
    try {
      await updateItem.mutateAsync({
        itemUuid: item.uuid,
        payload: { status: "cancelled" },
      });
      toast({ variant: "success", title: "Procedure removed from plan" });
    } catch (error) {
      reportError("Could not update the procedure", error);
    }
  }

  const plans = plansQuery.data ?? [];
  const procedures = proceduresQuery.data ?? [];
  const isMutating =
    updatePlan.isPending || updateItem.isPending || performItem.isPending;

  return (
    <div
      className="grid min-h-0 flex-1 grid-cols-1 xl:grid-cols-[minmax(0,1fr)_22rem]"
      data-testid="dental-treatment-plan-tab-panel"
    >
      <section className="space-y-4 bg-white px-4 py-5 sm:px-6" aria-label="Treatment plans">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-brand-navy">Treatment plans</h2>
            <p className="mt-1 text-xs text-brand-muted">
              Sequence procedures, agree them with the client, then perform them.
              Performed procedures are billed to this visit.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {canPerform ? (
              <SecondaryButton
                type="button"
                onClick={() => setIsProcedureDialogOpen(true)}
                data-testid="dental-record-procedure"
              >
                Record procedure
              </SecondaryButton>
            ) : null}
            {canManage ? (
              <PrimaryButton
                type="button"
                onClick={() => setIsPlanDialogOpen(true)}
                data-testid="dental-new-plan"
              >
                New plan
              </PrimaryButton>
            ) : null}
          </div>
        </div>

        {!canManage && !canPerform ? (
          <OpdConsultFormLocked
            message={
              isChartLocked
                ? "This encounter is closed. Plans are read-only."
                : "Your role can view treatment plans but not change them."
            }
          />
        ) : null}

        {plansQuery.isLoading ? (
          <Skeleton className="h-40 w-full rounded-xl" />
        ) : plansQuery.isError ? (
          <p className="text-sm text-red-700">Could not load treatment plans.</p>
        ) : plans.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No treatment plans yet"
            description="Create a plan to propose and sequence the client's dental procedures."
          />
        ) : (
          <ul className="space-y-4">
            {plans.map((plan) => (
              <li
                key={plan.uuid}
                className="rounded-xl border border-dash-border"
                data-testid="dental-plan"
              >
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-dash-border/70 px-4 py-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold text-brand-navy">{plan.title}</h3>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[11px] font-medium",
                          STATUS_PILL_CLASS[plan.status],
                        )}
                        data-testid="dental-plan-status"
                      >
                        {PLAN_STATUS_LABELS[plan.status]}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[11px] text-brand-muted">
                      {formatDisplayDate(plan.created_at)}
                      {plan.created_by_name ? ` · ${plan.created_by_name}` : null}
                      {` · Estimated ${plan.estimated_total}`}
                    </p>
                    {plan.notes ? (
                      <p className="mt-1 text-xs text-brand-slate">{plan.notes}</p>
                    ) : null}
                  </div>
                  {canManage ? (
                    <div className="flex flex-wrap gap-1.5">
                      {planStatusActions(plan.status).map((action) => (
                        <Button
                          key={action.status}
                          type="button"
                          size="sm"
                          variant={action.status === "cancelled" ? "ghost" : "outline"}
                          className={cn(
                            "h-8 text-xs",
                            action.status === "cancelled"
                              ? "text-brand-muted hover:text-red-600"
                              : null,
                          )}
                          disabled={isMutating}
                          onClick={() => void changePlanStatus(plan, action.status)}
                          data-testid={`dental-plan-action-${action.status}`}
                        >
                          {action.label}
                        </Button>
                      ))}
                      {isPlanOpen(plan.status) ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs"
                          onClick={() => setItemPlan(plan)}
                          data-testid="dental-plan-add-item"
                        >
                          Add procedure
                        </Button>
                      ) : null}
                    </div>
                  ) : null}
                </div>

                {plan.items.length === 0 ? (
                  <p className="px-4 py-4 text-sm text-brand-muted">
                    No procedures on this plan yet.
                  </p>
                ) : (
                  <table className="w-full text-left text-sm">
                    <thead className="text-[11px] uppercase tracking-wide text-brand-muted">
                      <tr>
                        <th scope="col" className="px-4 py-2 font-medium">#</th>
                        <th scope="col" className="px-2 py-2 font-medium">Procedure</th>
                        <th scope="col" className="px-2 py-2 font-medium">Teeth</th>
                        <th scope="col" className="px-2 py-2 font-medium">Estimate</th>
                        <th scope="col" className="px-2 py-2 font-medium">Status</th>
                        <th scope="col" className="px-4 py-2">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {plan.items.map((item) => (
                        <tr
                          key={item.uuid}
                          className="border-t border-dash-border/70"
                          data-testid="dental-plan-item"
                        >
                          <td className="px-4 py-2 tabular-nums text-brand-muted">
                            {item.sequence}
                          </td>
                          <td className="px-2 py-2 text-brand-navy">{item.product_name}</td>
                          <td className="px-2 py-2 tabular-nums text-brand-slate">
                            {item.tooth_numbers.join(", ") || "—"}
                            {item.surfaces.length > 0
                              ? ` · ${formatSurfaces(item.surfaces)}`
                              : null}
                          </td>
                          <td className="px-2 py-2 tabular-nums text-brand-slate">
                            {item.estimated_price ?? "—"}
                          </td>
                          <td className="px-2 py-2 text-xs text-brand-slate">
                            {PLAN_ITEM_STATUS_LABELS[item.status]}
                          </td>
                          <td className="px-4 py-2 text-right">
                            <div className="flex justify-end gap-1">
                              {item.status === "planned" &&
                              canPerform &&
                              canPerformPlanItems(plan.status) ? (
                                <Button
                                  type="button"
                                  size="sm"
                                  className="h-7 text-xs"
                                  disabled={isMutating}
                                  onClick={() => setPerformingItem(item)}
                                  data-testid="dental-plan-item-perform"
                                >
                                  Perform
                                </Button>
                              ) : null}
                              {item.status === "planned" &&
                              canManage &&
                              isPlanOpen(plan.status) ? (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 text-xs text-brand-muted hover:text-red-600"
                                  disabled={isMutating}
                                  onClick={() => void cancelItem(item)}
                                >
                                  Remove
                                </Button>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="border-t border-dash-border/70 bg-dash-canvas xl:border-l xl:border-t-0">
        <OpdConsultContentPanel
          title="Procedures this visit"
          count={procedures.length}
          data-testid="dental-visit-procedures"
        >
          {procedures.length === 0 ? (
            <p className="text-sm text-dash-muted">No procedures performed this visit.</p>
          ) : (
            <ul className="space-y-2">
              {procedures.map((procedure) => (
                <li
                  key={procedure.uuid}
                  className="rounded-lg border border-dash-border/70 bg-white px-3 py-2"
                >
                  <p className="text-sm font-medium text-brand-navy">
                    {procedure.procedure_name}
                  </p>
                  <p className="mt-0.5 text-[11px] text-brand-muted">
                    {procedure.tooth_numbers.length > 0
                      ? `Teeth ${procedure.tooth_numbers.join(", ")} · `
                      : null}
                    {formatDisplayDateTime(procedure.created_at)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </OpdConsultContentPanel>
      </div>

      <DentalPlanDialog
        open={isPlanDialogOpen}
        onOpenChange={setIsPlanDialogOpen}
        onSubmit={async (values) => {
          try {
            const plan = await createPlan.mutateAsync(toDentalPlanPayload(values));
            toast({ variant: "success", title: "Treatment plan created" });
            setIsPlanDialogOpen(false);
            setItemPlan(plan);
          } catch (error) {
            reportError("Could not create the plan", error);
          }
        }}
      />
      <DentalProcedureDialog
        mode="plan-item"
        open={itemPlan !== null}
        onOpenChange={(open) => {
          if (!open) {
            setItemPlan(null);
          }
        }}
        onSubmit={async (values) => {
          if (!itemPlan) {
            return;
          }
          try {
            await addItem.mutateAsync({
              planUuid: itemPlan.uuid,
              payload: toDentalPlanItemPayload(values),
            });
            toast({ variant: "success", title: "Procedure added to plan" });
            setItemPlan(null);
          } catch (error) {
            reportError("Could not add the procedure", error);
          }
        }}
      />
      <DentalProcedureDialog
        mode="procedure"
        open={isProcedureDialogOpen}
        onOpenChange={setIsProcedureDialogOpen}
        onSubmit={async (values) => {
          try {
            await performProcedure.mutateAsync(toDentalProcedurePayload(values));
            toast({
              variant: "success",
              title: "Procedure recorded",
              description: "It was added to the visit bill.",
            });
            setIsProcedureDialogOpen(false);
          } catch (error) {
            reportError("Could not record the procedure", error);
          }
        }}
      />
      <DentalPerformDialog
        item={performingItem}
        onOpenChange={(open) => {
          if (!open) {
            setPerformingItem(null);
          }
        }}
        onSubmit={async (values) => {
          if (!performingItem) {
            return;
          }
          try {
            await performItem.mutateAsync({
              itemUuid: performingItem.uuid,
              payload: toDentalPerformPayload(values),
            });
            toast({
              variant: "success",
              title: "Procedure performed",
              description: "It was added to the visit bill.",
            });
            setPerformingItem(null);
          } catch (error) {
            reportError("Could not perform the procedure", error);
          }
        }}
      />
    </div>
  );
}
