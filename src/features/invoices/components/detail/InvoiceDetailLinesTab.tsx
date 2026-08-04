"use client";

import { Info } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { isInsuranceInvoice } from "@/features/claims/services/claims.service";
import { syncInvoiceLineTariffCode } from "@/features/invoices/services/invoices.service";
import type { Invoice } from "@/features/invoices/types/invoice.types";
import type { InvoiceLine } from "@/features/invoices/types/invoice.types";
import { formatInvoiceAmount } from "@/features/invoices/utils/format-invoice";
import { isInvoiceLineNonPayable } from "@/features/invoices/utils/invoice-line-payability";
import { LineNonPayableBadge } from "@/features/sales-orders/components/detail/LineNonPayableBadge";
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

function formatTariffCode(value: string | null | undefined): string {
  return value?.trim() ? value : "—";
}

export function InvoiceDetailLinesTab({
  invoice,
  isActive,
  onInvoiceRefresh,
}: InvoiceDetailLinesTabProps) {
  const { toast } = useToast();
  const lines = invoice.lines ?? [];
  const showNonPayableBadges = isInsuranceInvoice(invoice);
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
      <div className="rounded-xl border border-brand-border bg-white">
        <div className="border-b border-brand-border px-4 py-3">
          <h3 className="text-sm font-semibold text-brand-navy">Line items</h3>
          <p className="mt-0.5 text-xs text-brand-muted">
            Products and services billed on this invoice.
          </p>
        </div>
        {lines.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-brand-muted">
            No line items on this invoice.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-brand-border bg-slate-50/80">
                  <th className="px-4 py-3 text-left text-sm font-medium text-brand-muted">
                    Item
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-brand-muted">
                    Code
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-brand-muted">
                    Qty
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-brand-muted">
                    Unit price
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-brand-muted">
                    Total
                  </th>
                  <th className="w-12 px-2 py-3">
                    <span className="sr-only">Details</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {lines.map((line) => (
                  <tr key={line.id}>
                    <td className="px-4 py-3 text-sm text-brand-navy">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <div>
                          <p className="font-medium">{line.name}</p>
                          {line.product_name ? (
                            <p className="text-xs text-brand-muted">{line.product_name}</p>
                          ) : null}
                        </div>
                        {showNonPayableBadges && isInvoiceLineNonPayable(line) ? (
                          <LineNonPayableBadge />
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-brand-slate">
                      {formatTariffCode(line.tariff_code)}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-brand-slate">
                      {line.quantity}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-brand-slate">
                      {formatInvoiceAmount(line.price_unit)}
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-medium text-brand-navy">
                      {formatInvoiceAmount(line.price_total)}
                    </td>
                    <td className="px-2 py-3">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8 text-brand-muted"
                        aria-label={`View details for ${line.name}`}
                        onClick={() => setBreakdownLine(line)}
                      >
                        <Info className="size-4" aria-hidden="true" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
