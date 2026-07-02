"use client";

import { EncounterDiagnosisPanel } from "@/features/clinical/components/EncounterDiagnosisPanel";
import { useInvoiceEncounterUuid } from "@/features/invoices/hooks/use-invoice-encounter-uuid";
import type { Invoice } from "@/features/invoices/types/invoice.types";
import { cn } from "@/lib/utils";

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
    <section
      className={cn("rounded-xl border border-brand-border bg-white p-6")}
      data-testid="invoice-diagnoses-tab"
    >
      <EncounterDiagnosisPanel
        visitUuid={invoice.visit_uuid ?? null}
        encounterUuid={encounterUuid}
        onDiagnosesChanged={onInvoiceRefresh}
      />
    </section>
  );
}
