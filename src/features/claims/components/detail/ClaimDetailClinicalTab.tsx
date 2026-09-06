"use client";

import { Plus } from "lucide-react";
import { useEffect, useState } from "react";

import { SecondaryButton } from "@/components/ui/app-buttons";
import { TableTextCell } from "@/components/table-text-cell";
import {
  ListPageDataTable,
  ListPageDataTableBody,
  ListPageDataTableCell,
  ListPageDataTableHeader,
  ListPageDataTableHeaderCell,
  ListPageDataTableHeaderRow,
  ListPageDataTableRow,
} from "@/features/app-shell/components/page-layout";
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

export function ClaimDetailClinicalTab({
  claim,
  isActive,
  onClaimUpdated,
}: ClaimDetailClinicalTabProps) {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [addDiagnosisOpen, setAddDiagnosisOpen] = useState(false);
  const [vitalsDialogOpen, setVitalsDialogOpen] = useState(false);
  const invoiceRef =
    claim.invoice_uuid ?? claim.invoice_id ?? claim.invoice ?? null;
  const encounterUuid = useInvoiceEncounterUuid(
    invoice ?? {
      encounter_uuid: null,
      visit_uuid: claim.visit_uuid ?? null,
    },
    isActive,
  );

  useEffect(() => {
    if (!isActive || !invoiceRef) {
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const data = await fetchInvoice(invoiceRef);
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
  }, [invoiceRef, isActive]);

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
      <section>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-brand-navy">
              Vitals on claim
            </h3>
            <p className="mt-1 text-sm text-brand-muted">
              Vital signs included on this insurance claim.
            </p>
          </div>
          {addVitalsButton}
        </div>

        {hasVitals ? (
          <p className="mt-4 text-sm text-brand-slate">{formatVitals(claim)}</p>
        ) : (
          <p
            className="mt-4 text-sm text-brand-muted"
            data-testid="claim-vitals-empty"
          >
            No vital signs on this claim.
          </p>
        )}
      </section>

      <section>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-brand-navy">
              Claim diagnoses
            </h3>
            <p className="mt-1 text-sm text-brand-muted">
              Diagnoses included on this insurance claim.
            </p>
          </div>
          {addDiagnosisButton}
        </div>

        {!hasClaimDiagnoses ? (
          <p
            className="mt-4 text-sm text-brand-muted"
            data-testid="claim-diagnoses-empty"
          >
            No diagnoses on this claim.
          </p>
        ) : (
          <div className="mt-4">
            <ListPageDataTable>
              <ListPageDataTableHeader>
                <ListPageDataTableHeaderRow>
                  <ListPageDataTableHeaderCell>Code</ListPageDataTableHeaderCell>
                  <ListPageDataTableHeaderCell>
                    Standard
                  </ListPageDataTableHeaderCell>
                  <ListPageDataTableHeaderCell>
                    Description
                  </ListPageDataTableHeaderCell>
                </ListPageDataTableHeaderRow>
              </ListPageDataTableHeader>
              <ListPageDataTableBody>
                {claim.diagnoses.map((diagnosis) => (
                  <ListPageDataTableRow key={diagnosis.id}>
                    <ListPageDataTableCell>
                      <TableTextCell className="font-mono text-sm text-brand-navy">
                        {diagnosis.code}
                      </TableTextCell>
                    </ListPageDataTableCell>
                    <ListPageDataTableCell>
                      <TableTextCell className="text-brand-slate">
                        {diagnosis.standard || "—"}
                      </TableTextCell>
                    </ListPageDataTableCell>
                    <ListPageDataTableCell>
                      <TableTextCell className="text-brand-slate">
                        {diagnosis.description || "—"}
                      </TableTextCell>
                    </ListPageDataTableCell>
                  </ListPageDataTableRow>
                ))}
              </ListPageDataTableBody>
            </ListPageDataTable>
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
