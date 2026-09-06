"use client";

import { EncounterDiagnosisPanel } from "@/features/clinical/components/EncounterDiagnosisPanel";
import { useInvoiceEncounterUuid } from "@/features/invoices/hooks/use-invoice-encounter-uuid";
import type { Invoice } from "@/features/invoices/types/invoice.types";

type InvoiceDiagnosesTabProps = {
  invoice: Invoice;
  isActive: boolean;
  onInvoiceRefresh?: () => void | Promise<void>;
};

export function InvoiceDiagnosesTab({
  invoice,
  isActive,
  onInvoiceRefresh,
}: InvoiceDiagnosesTabProps) {
  const encounterUuid = useInvoiceEncounterUuid(invoice, isActive);

  if (!isActive) {
    return null;
  }

  return (
    <section data-testid="invoice-diagnoses-tab">
      <EncounterDiagnosisPanel
        visitUuid={invoice.visit_uuid ?? null}
        encounterUuid={encounterUuid}
        sourcePlatform="INVOICE"
        onDiagnosesChanged={onInvoiceRefresh}
      />
    </section>
  );
}
