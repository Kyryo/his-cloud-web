"use client";

import { Activity, Plus, Stethoscope } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { SecondaryButton } from "@/components/ui/app-buttons";
import { TableTextCell } from "@/components/table-text-cell";
import { AddClaimVitalsDialog } from "@/features/claims/components/AddClaimVitalsDialog";
import { AddEncounterDiagnosisDialog } from "@/features/clinical/components/AddEncounterDiagnosisDialog";
import {
  addClaimDiagnosis,
  fetchClaim,
} from "@/features/claims/services/claims.service";
import type { ClaimDetail } from "@/features/claims/types/claims.types";
import { useInvoiceEncounterUuid } from "@/features/invoices/hooks/use-invoice-encounter-uuid";
import { fetchInvoice } from "@/features/invoices/services/invoices.service";
import type { Invoice } from "@/features/invoices/types/invoice.types";

type ClaimDetailClinicalTabProps = {
  claim: ClaimDetail;
  isActive: boolean;
  onClaimUpdated?: (claim: ClaimDetail) => void;
};

function hasClaimVitals(claim: ClaimDetail): boolean {
  const vitals = claim.vitals ?? {};
  return (
    (vitals.height != null && vitals.height !== "") ||
    (vitals.weight != null && vitals.weight !== "") ||
    (vitals.systolic_pressure != null && vitals.diastolic_pressure != null)
  );
}

function formatVitals(claim: ClaimDetail): string {
  const vitals = claim.vitals ?? {};
  const parts: string[] = [];
  if (vitals.height != null && vitals.height !== "") {
    parts.push(`Height ${vitals.height}`);
  }
  if (vitals.weight != null && vitals.weight !== "") {
    parts.push(`Weight ${vitals.weight}`);
  }
  if (vitals.systolic_pressure != null && vitals.diastolic_pressure != null) {
    parts.push(`BP ${vitals.systolic_pressure}/${vitals.diastolic_pressure}`);
  }
  return parts.join(" · ");
}

function CardEmptyState({
  icon: Icon,
  title,
  description,
  action,
  testId,
}: {
  icon: typeof Activity;
  title: string;
  description: string;
  action?: ReactNode;
  testId?: string;
}) {
  return (
    <div
      className="mt-4 flex flex-col items-center justify-center rounded-lg border border-dashed border-brand-border bg-slate-50/60 px-4 py-10 text-center"
      data-testid={testId}
    >
      <div className="flex size-10 items-center justify-center rounded-xl bg-white text-brand-muted shadow-sm ring-1 ring-brand-border">
        <Icon className="size-5" strokeWidth={1.75} aria-hidden="true" />
      </div>
      <p className="mt-3 text-sm font-medium text-brand-navy">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-brand-muted">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function ClaimDetailClinicalTab({
  claim,
  isActive,
  onClaimUpdated,
}: ClaimDetailClinicalTabProps) {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [addDiagnosisOpen, setAddDiagnosisOpen] = useState(false);
  const [vitalsDialogOpen, setVitalsDialogOpen] = useState(false);
  const invoiceId = claim.invoice_id || claim.invoice;
  const encounterUuid = useInvoiceEncounterUuid(
    invoice ?? {
      encounter_uuid: null,
      visit_uuid: claim.visit_uuid ?? null,
    },
    isActive,
  );

  useEffect(() => {
    if (!isActive || !invoiceId) {
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const data = await fetchInvoice(invoiceId);
        if (!cancelled) {
          setInvoice(data);
        }
      } catch {
        if (!cancelled) {
          setInvoice(null);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [invoiceId, isActive]);

  if (!isActive) {
    return null;
  }

  const isDraft = String(claim.status ?? "").toLowerCase() === "draft";
  const hasVitals = hasClaimVitals(claim);
  const hasClaimDiagnoses = claim.diagnoses.length > 0;
  const visitUuid = claim.visit_uuid ?? "";
  const resolvedEncounterUuid =
    encounterUuid ?? invoice?.encounter_uuid ?? "";
  const canEditClinical = isDraft;
  const canAddDiagnosis = canEditClinical && Boolean(visitUuid);

  async function refreshClaim() {
    const refreshed = await fetchClaim(claim.id);
    onClaimUpdated?.(refreshed);
  }

  const addVitalsButton = canEditClinical ? (
    <SecondaryButton
      type="button"
      size="sm"
      className="h-9 px-3"
      onClick={() => setVitalsDialogOpen(true)}
      data-testid="claim-add-vitals-button"
    >
      <Plus className="size-4" aria-hidden="true" />
      {hasVitals ? "Edit vital signs" : "Add vital signs"}
    </SecondaryButton>
  ) : null;

  const addDiagnosisButton = canAddDiagnosis ? (
    <SecondaryButton
      type="button"
      size="sm"
      className="h-9 px-3"
      onClick={() => setAddDiagnosisOpen(true)}
      data-testid="claim-add-diagnosis-button"
    >
      <Plus className="size-4" aria-hidden="true" />
      Add diagnosis
    </SecondaryButton>
  ) : null;

  return (
    <div className="space-y-4" data-testid="claim-detail-clinical-tab">
      <section className="rounded-xl border border-brand-border bg-white p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-brand-navy">
              Vitals on claim
            </h3>
            <p className="mt-1 text-sm text-brand-muted">
              Vital signs included on this insurance claim.
            </p>
          </div>
          {hasVitals ? addVitalsButton : null}
        </div>

        {hasVitals ? (
          <p className="mt-4 text-sm text-brand-slate">{formatVitals(claim)}</p>
        ) : (
          <CardEmptyState
            icon={Activity}
            title="No vital signs on this claim"
            description="We did not find any vital signs snapshotted for this claim."
            action={addVitalsButton}
            testId="claim-vitals-empty"
          />
        )}
      </section>

      <section className="rounded-xl border border-brand-border bg-white p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-brand-navy">
              Claim diagnoses
            </h3>
            <p className="mt-1 text-sm text-brand-muted">
              Diagnoses included on this insurance claim.
            </p>
          </div>
          {hasClaimDiagnoses ? addDiagnosisButton : null}
        </div>

        {!hasClaimDiagnoses ? (
          <CardEmptyState
            icon={Stethoscope}
            title="No diagnoses on this claim"
            description="We did not find any diagnoses snapshotted for this claim."
            action={addDiagnosisButton}
            testId="claim-diagnoses-empty"
          />
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-brand-border text-left text-xs font-medium text-brand-muted">
                  <th className="px-2 py-2">Code</th>
                  <th className="px-2 py-2">Standard</th>
                  <th className="px-2 py-2">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {claim.diagnoses.map((diagnosis) => (
                  <tr key={diagnosis.id}>
                    <td className="px-2 py-2">
                      <TableTextCell className="font-mono text-sm text-brand-navy">
                        {diagnosis.code}
                      </TableTextCell>
                    </td>
                    <td className="px-2 py-2">
                      <TableTextCell className="text-brand-slate">
                        {diagnosis.standard || "—"}
                      </TableTextCell>
                    </td>
                    <td className="px-2 py-2">
                      <TableTextCell className="text-brand-slate">
                        {diagnosis.description || "—"}
                      </TableTextCell>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {canEditClinical ? (
        <AddClaimVitalsDialog
          claim={claim}
          open={vitalsDialogOpen}
          onOpenChange={setVitalsDialogOpen}
          onSuccess={(updated) => {
            onClaimUpdated?.(updated);
          }}
        />
      ) : null}

      {canAddDiagnosis && visitUuid ? (
        <AddEncounterDiagnosisDialog
          visitUuid={visitUuid}
          encounterUuid={resolvedEncounterUuid || null}
          sourcePlatform="INVOICE"
          alsoSaveAsEncounter={{
            defaultChecked: true,
            onSaveClaimOnly: async (payload) => {
              const updated = await addClaimDiagnosis(claim.id, payload);
              onClaimUpdated?.(updated);
            },
          }}
          open={addDiagnosisOpen}
          onOpenChange={setAddDiagnosisOpen}
          onSuccess={async () => {
            await refreshClaim();
          }}
        />
      ) : null}
    </div>
  );
}
