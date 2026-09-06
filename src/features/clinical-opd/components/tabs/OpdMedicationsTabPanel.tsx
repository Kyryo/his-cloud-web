"use client";

import { Pill, Plus } from "lucide-react";
import { useState } from "react";

import { PrimaryButton } from "@/components/ui/app-buttons";
import { Badge } from "@/components/ui/badge";
import type { DetailRecordRowMenuAction } from "@/components/detail/detail-record-row-menu";
import {
  OpdEncounterRecordList,
  OpdEncounterRecordListItem,
} from "@/features/clinical-opd/components/detail/OpdEncounterRecordList";
import { OpdEncounterTabEmptyState } from "@/features/clinical-opd/components/detail/OpdEncounterTabEmptyState";
import { OpdEncounterTabSkeleton } from "@/features/clinical-opd/components/detail/OpdEncounterTabSkeleton";
import { OpdPhysicianTabShell } from "@/features/clinical-opd/components/detail/OpdPhysicianTabShell";
import { useOpdEncounterWorkspace } from "@/features/clinical-opd/components/detail/opd-encounter-workspace-context";
import { AddPrescriptionDialog } from "@/features/clinical-opd/components/tabs/AddPrescriptionDialog";
import {
  useCancelPrescription,
  useEncounterWorkspace,
  useFinalizePrescription,
} from "@/features/clinical-opd/hooks/use-clinical-opd";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage } from "@/lib/bff-field-errors";
import { useToast } from "@/providers/toast-provider";

type OpdMedicationsTabPanelProps = {
  visitUuid: string;
  encounterUuid: string;
  isActive?: boolean;
};

export function OpdMedicationsTabPanel({
  visitUuid,
  encounterUuid,
  isActive = true,
}: OpdMedicationsTabPanelProps) {
  const { toast } = useToast();
  const { encounter, capabilities } = useOpdEncounterWorkspace();
  const { prescriptions } = useEncounterWorkspace(visitUuid, encounterUuid);
  const finalizePrescription = useFinalizePrescription(visitUuid, encounterUuid);
  const cancelPrescription = useCancelPrescription(visitUuid, encounterUuid);
  const [dialogOpen, setDialogOpen] = useState(false);

  const canPrescribe = capabilities.includes("prescribe");

  if (!isActive) {
    return null;
  }

  if (prescriptions.isLoading) {
    return <OpdEncounterTabSkeleton rows={4} />;
  }

  const items = (prescriptions.data ?? []).filter(
    (prescription) => prescription.status !== "cancelled",
  );

  const addAction = canPrescribe ? (
    <PrimaryButton
      type="button"
      size="sm"
      onClick={() => setDialogOpen(true)}
      data-testid="opd-medications-add-button"
    >
      <Plus className="size-4" aria-hidden="true" />
      Add prescription
    </PrimaryButton>
  ) : null;

  const content =
    items.length === 0 ? (
      <OpdEncounterTabEmptyState
        icon={Pill}
        title="No medications recorded"
        description="Prescriptions and medication orders for this encounter will appear here."
        action={addAction}
        data-testid="opd-medications-empty-state"
      />
    ) : (
      <OpdEncounterRecordList
        title={
          <span className="inline-flex items-center gap-1.5">
            <Pill className="size-4 text-brand-primary" aria-hidden="true" />
            <span>Medications</span>
          </span>
        }
        description="Prescriptions and medication orders for this encounter."
        action={addAction}
        data-testid="opd-medications-list"
      >
        {items.map((prescription) => {
          const menuActions: DetailRecordRowMenuAction[] = [];
          if (canPrescribe && prescription.status === "draft") {
            menuActions.push({
              label: "Finalize",
              onClick: () => {
                void (async () => {
                  try {
                    await finalizePrescription.mutateAsync(prescription.uuid);
                    toast({
                      title: "Prescription finalized",
                      variant: "success",
                    });
                  } catch (error) {
                    toast({
                      title: "Could not finalize",
                      description:
                        error instanceof BffError
                          ? formatBffErrorMessage(error.message, error.errors)
                          : "Unable to finalize this prescription.",
                      variant: "error",
                    });
                  }
                })();
              },
            });
          }
          if (canPrescribe && prescription.status !== "cancelled") {
            menuActions.push({
              label: "Cancel",
              onClick: () => {
                void (async () => {
                  try {
                    await cancelPrescription.mutateAsync(prescription.uuid);
                    toast({
                      title: "Prescription cancelled",
                      variant: "success",
                    });
                  } catch (error) {
                    toast({
                      title: "Could not cancel",
                      description:
                        error instanceof BffError
                          ? formatBffErrorMessage(error.message, error.errors)
                          : "Unable to cancel this prescription.",
                      variant: "error",
                    });
                  }
                })();
              },
            });
          }

          return (
            <OpdEncounterRecordListItem
              key={prescription.uuid}
              compact
              icon={Pill}
              title={prescription.product_name}
              badges={<Badge variant="outline">{prescription.status}</Badge>}
              description={
                <div className="space-y-0.5">
                  <p>
                    {[prescription.dose, prescription.route, prescription.frequency]
                      .filter(Boolean)
                      .join(" · ")}
                    {prescription.duration ? ` · ${prescription.duration}` : ""}
                  </p>
                  <p>
                    Amount prescribed: {prescription.quantity}
                    {prescription.clinical_uom
                      ? ` ${prescription.clinical_uom}`
                      : ""}{" "}
                    · Units to charge: {prescription.charge_quantity}
                  </p>
                </div>
              }
              dateTime={encounter?.started_at ?? new Date(0).toISOString()}
              createdByName={prescription.prescribed_by_name}
              menuActions={menuActions.length > 0 ? menuActions : undefined}
            />
          );
        })}
      </OpdEncounterRecordList>
    );

  return (
    <OpdPhysicianTabShell visitUuid={visitUuid} encounterUuid={encounterUuid}>
      {content}
      {canPrescribe ? (
        <AddPrescriptionDialog
          visitUuid={visitUuid}
          encounterUuid={encounterUuid}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
        />
      ) : null}
    </OpdPhysicianTabShell>
  );
}
