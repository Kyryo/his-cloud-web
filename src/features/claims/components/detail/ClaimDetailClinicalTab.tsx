"use client";

import { Stethoscope } from "lucide-react";
import { useEffect, useState } from "react";

import { DetailTabEmptyState } from "@/components/detail/detail-tab-empty-state";
import { TableTextCell } from "@/components/table-text-cell";
import { EncounterDiagnosisPanel } from "@/features/clinical/components/EncounterDiagnosisPanel";
import type { ClaimDetail } from "@/features/claims/types/claims.types";
import { useInvoiceEncounterUuid } from "@/features/invoices/hooks/use-invoice-encounter-uuid";
import { fetchInvoice } from "@/features/invoices/services/invoices.service";
import type { Invoice } from "@/features/invoices/types/invoice.types";
import { cn } from "@/lib/utils";

type ClaimDetailClinicalTabProps = {
  claim: ClaimDetail;
  isActive: boolean;
};

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
  return parts.length > 0 ? parts.join(" · ") : "—";
}

export function ClaimDetailClinicalTab({
  claim,
  isActive,
}: ClaimDetailClinicalTabProps) {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
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

  const hasClaimDiagnoses = claim.diagnoses.length > 0;

  return (
    <div className="space-y-4" data-testid="claim-detail-clinical-tab">
      <section className="rounded-xl border border-brand-border bg-white p-6">
        <h3 className="text-sm font-semibold text-brand-navy">Vitals on claim</h3>
        <p className="mt-2 text-sm text-brand-slate">{formatVitals(claim)}</p>
      </section>

      <section className="rounded-xl border border-brand-border bg-white p-6">
        <h3 className="text-sm font-semibold text-brand-navy">Claim diagnoses</h3>
        {!hasClaimDiagnoses ? (
          <p className="mt-3 text-sm text-brand-muted">
            No diagnoses were snapshotted on this claim.
          </p>
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

      <section
        className={cn("rounded-xl border border-brand-border bg-white p-6")}
      >
        <h3 className="mb-4 text-sm font-semibold text-brand-navy">
          Encounter diagnoses
        </h3>
        {claim.visit_uuid ? (
          <EncounterDiagnosisPanel
            visitUuid={claim.visit_uuid}
            encounterUuid={encounterUuid ?? invoice?.encounter_uuid ?? null}
            sourcePlatform="INVOICE"
          />
        ) : (
          <DetailTabEmptyState
            icon={Stethoscope}
            title="No visit available"
            description="Encounter diagnoses require a visit linked to this claim."
          />
        )}
      </section>
    </div>
  );
}
