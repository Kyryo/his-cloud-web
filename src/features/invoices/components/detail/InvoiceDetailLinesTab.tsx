"use client";

import { useState } from "react";

import { isInsuranceInvoice } from "@/features/claims/services/claims.service";
import {
  InvoiceLineList,
  InvoiceLineListEmpty,
} from "@/features/invoices/components/detail/InvoiceLineList";
import { syncInvoiceLineTariffCode } from "@/features/invoices/services/invoices.service";
import type { Invoice } from "@/features/invoices/types/invoice.types";
import type { InvoiceLine } from "@/features/invoices/types/invoice.types";
import { LinePricingBreakdownDialog } from "@/features/sales-orders/components/detail/LinePricingBreakdownDialog";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage } from "@/lib/bff-field-errors";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

type InvoiceDetailLinesTabProps = {
  invoice: Invoice;
  isActive: boolean;
  onInvoiceRefresh?: () => void | Promise<void>;
};

export function InvoiceDetailLinesTab({
  invoice,
  isActive,
  onInvoiceRefresh,
}: InvoiceDetailLinesTabProps) {
  const { toast } = useToast();
  const lines = invoice.lines ?? [];
  const [breakdownLine, setBreakdownLine] = useState<InvoiceLine | null>(null);
  const [isSyncingTariffCode, setIsSyncingTariffCode] = useState(false);

  const activeBreakdownLine =
    breakdownLine == null
      ? null
      : (lines.find((line) => line.id === breakdownLine.id) ?? breakdownLine);

  async function handleSyncTariffCode() {
    if (!activeBreakdownLine) {
      return;
    }

    setIsSyncingTariffCode(true);
    try {
      const updated = await syncInvoiceLineTariffCode(
        invoice.id,
        activeBreakdownLine.id,
      );
      const refreshedLine =
        updated.lines?.find((line) => line.id === activeBreakdownLine.id) ?? null;
      if (refreshedLine) {
        setBreakdownLine(refreshedLine);
      }
      await onInvoiceRefresh?.();
      toast({
        variant: "success",
        title: "Tariff code synced",
        description: "The product tariff code was applied to this line.",
      });
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not sync tariff code",
        description:
          error instanceof BffError
            ? formatBffErrorMessage(error.message, error.errors)
            : error instanceof Error
              ? error.message
              : "Something went wrong.",
      });
    } finally {
      setIsSyncingTariffCode(false);
    }
  }

  return (
    <section
      className={cn(!isActive && "hidden")}
      data-testid="invoice-detail-lines-tab"
    >
      {lines.length === 0 ? (
        <InvoiceLineListEmpty>
          No line items on this invoice.
        </InvoiceLineListEmpty>
      ) : (
        <InvoiceLineList invoice={invoice} onViewDetails={setBreakdownLine} />
      )}

      <LinePricingBreakdownDialog
        line={activeBreakdownLine}
        capturedAt={invoice.invoice_date}
        open={breakdownLine != null}
        onOpenChange={(open) => {
          if (!open) {
            setBreakdownLine(null);
          }
        }}
        onSyncTariffCode={
          isInsuranceInvoice(invoice) ? handleSyncTariffCode : undefined
        }
        isSyncingTariffCode={isSyncingTariffCode}
      />
    </section>
  );
}
