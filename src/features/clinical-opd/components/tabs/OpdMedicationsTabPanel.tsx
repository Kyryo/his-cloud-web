"use client";

import { Pill, X } from "lucide-react";
import { useState } from "react";

import { SecondaryButton } from "@/components/ui/app-buttons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  OpdConsultContentPanel,
  OpdConsultFormLocked,
  OpdConsultFormPanel,
  OpdConsultLayout,
} from "@/features/clinical-opd/components/detail/OpdConsultLayout";
import { OpdEncounterRecordList } from "@/features/clinical-opd/components/detail/OpdEncounterRecordList";
import { OpdEncounterTabEmptyState } from "@/features/clinical-opd/components/detail/OpdEncounterTabEmptyState";
import { OpdEncounterTabSkeleton } from "@/features/clinical-opd/components/detail/OpdEncounterTabSkeleton";
import { useOpdEncounterWorkspace } from "@/features/clinical-opd/components/detail/opd-encounter-workspace-context";
import {
  AddPrescriptionDialog,
  PRESCRIPTION_FORM_ID,
} from "@/features/clinical-opd/components/tabs/AddPrescriptionDialog";
import {
  useCancelPrescription,
  useEncounterWorkspace,
} from "@/features/clinical-opd/hooks/use-clinical-opd";
import type { EncounterPrescription } from "@/features/clinical-opd/types/clinical-opd.types";
import { formatDisplayDateTime } from "@/features/customers/utils/format-customer";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage } from "@/lib/bff-field-errors";
import { useToast } from "@/providers/toast-provider";

type OpdMedicationsTabPanelProps = {
  visitUuid: string;
  encounterUuid: string;
  isActive?: boolean;
};

function prescriptionSig(prescription: EncounterPrescription): string {
  const parts = [
    prescription.dose,
    prescription.route,
    prescription.frequency,
  ].filter(Boolean);
  const base = parts.join(" · ");
  if (prescription.duration) {
    return base ? `${base} · ${prescription.duration}` : prescription.duration;
  }
  return base;
}

export function OpdMedicationsTabPanel({
  visitUuid,
  encounterUuid,
  isActive = true,
}: OpdMedicationsTabPanelProps) {
  const { toast } = useToast();
  const { encounter, capabilities, isChartLocked } = useOpdEncounterWorkspace();
  const { prescriptions } = useEncounterWorkspace(visitUuid, encounterUuid);
  const cancelPrescription = useCancelPrescription(visitUuid, encounterUuid);
  const [busyUuid, setBusyUuid] = useState<string | null>(null);

  const canPrescribe = capabilities.includes("prescribe") && !isChartLocked;

  if (!isActive) {
    return null;
  }

  if (prescriptions.isLoading) {
    return <OpdEncounterTabSkeleton rows={4} />;
  }

  const items = (prescriptions.data ?? []).filter(
    (prescription) => prescription.status !== "cancelled",
  );

  async function handleCancel(prescription: EncounterPrescription) {
    setBusyUuid(prescription.uuid);
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
    } finally {
      setBusyUuid(null);
    }
  }

  const recordedAt = encounter?.started_at ?? new Date(0).toISOString();

  const content =
    items.length === 0 ? (
      <OpdEncounterTabEmptyState
        icon={Pill}
        title="No medications recorded"
        description="Prescriptions you save on the left will show up here for this visit."
        data-testid="opd-medications-empty-state"
      />
    ) : (
      <OpdEncounterRecordList
        title="This visit"
        data-testid="opd-medications-list"
      >
        {items.map((prescription) => {
          const sig = prescriptionSig(prescription);
          const isBusy = busyUuid === prescription.uuid;
          const canCancel =
            canPrescribe && prescription.status !== "cancelled";

          return (
            <li
              key={prescription.uuid}
              className="px-4 py-2.5 sm:px-5"
              data-testid={`opd-medications-item-${prescription.uuid}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 space-y-1.5">
                  <p className="truncate text-sm font-medium text-brand-navy">
                    {prescription.product_name}
                  </p>
                  {sig ? (
                    <p className="truncate text-xs text-brand-muted">{sig}</p>
                  ) : null}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge variant="secondary">{prescription.status}</Badge>
                    <span className="inline-flex flex-wrap items-baseline gap-x-2 text-xs text-brand-muted">
                      <time dateTime={recordedAt}>
                        {formatDisplayDateTime(recordedAt)}
                      </time>
                      {prescription.prescribed_by_name ? (
                        <>
                          <span className="text-dash-muted" aria-hidden="true">
                            ·
                          </span>
                          <span>{prescription.prescribed_by_name}</span>
                        </>
                      ) : null}
                    </span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {canCancel ? (
                    <SecondaryButton
                      type="button"
                      size="icon"
                      className="size-7 rounded-full text-brand-muted hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                      aria-label={`Cancel ${prescription.product_name}`}
                      data-testid={`opd-medications-cancel-${prescription.uuid}`}
                      disabled={isBusy}
                      onClick={() => {
                        void handleCancel(prescription);
                      }}
                    >
                      <X className="size-3.5" aria-hidden="true" />
                    </SecondaryButton>
                  ) : null}
                </div>
              </div>
            </li>
          );
        })}
      </OpdEncounterRecordList>
    );

  return (
    <OpdConsultLayout
      historySection="medications"
      form={
        canPrescribe ? (
          <OpdConsultFormPanel
            title="Add treatment"
            action={
              <Button
                type="submit"
                form={PRESCRIPTION_FORM_ID}
                size="sm"
                className="h-8"
                data-testid="opd-medications-header-save"
              >
                Save
              </Button>
            }
          >
            <AddPrescriptionDialog
              visitUuid={visitUuid}
              encounterUuid={encounterUuid}
              open
              onOpenChange={() => undefined}
              embedded
            />
          </OpdConsultFormPanel>
        ) : (
          <OpdConsultFormPanel title="Add treatment">
            <OpdConsultFormLocked message="Your role cannot prescribe on this encounter." />
          </OpdConsultFormPanel>
        )
      }
      content={
        <OpdConsultContentPanel title="Treatment" count={items.length}>
          {content}
        </OpdConsultContentPanel>
      }
    />
  );
}
