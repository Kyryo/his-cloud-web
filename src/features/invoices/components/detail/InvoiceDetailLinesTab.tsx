"use client";

import { Info } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { Invoice } from "@/features/invoices/types/invoice.types";
import type { InvoiceLine } from "@/features/invoices/types/invoice.types";
import { formatInvoiceAmount } from "@/features/invoices/utils/format-invoice";
import { LineExcessBadge } from "@/features/sales-orders/components/detail/LineExcessBadge";
import { LinePricingBreakdownDialog } from "@/features/sales-orders/components/detail/LinePricingBreakdownDialog";
import { LinePricelistCell } from "@/features/sales-orders/components/detail/LinePricelistCell";
import { cn } from "@/lib/utils";

type InvoiceDetailLinesTabProps = {
  invoice: Invoice;
  isActive: boolean;
};

export function InvoiceDetailLinesTab({
  invoice,
  isActive,
}: InvoiceDetailLinesTabProps) {
  const lines = invoice.lines ?? [];
  const [breakdownLine, setBreakdownLine] = useState<InvoiceLine | null>(null);

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
                    Product
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-brand-muted">
                    Pricing
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-brand-muted">
                    Qty
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-brand-muted">
                    Unit price
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-brand-muted">
                    Insurer
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-brand-muted">
                    Client
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-brand-muted">
                    Excess
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-brand-muted">
                    Subtotal
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
                      <p className="font-medium">{line.name}</p>
                      <p className="text-xs text-brand-muted">{line.product_name}</p>
                    </td>
                    <td className="px-4 py-3">
                      <LinePricelistCell
                        isPayable={line.is_payable}
                        pricelistName={null}
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-brand-slate">{line.quantity}</td>
                    <td className="px-4 py-3 text-sm text-brand-slate">
                      {formatInvoiceAmount(line.price_unit)}
                    </td>
                    <td className="px-4 py-3 text-sm text-brand-slate">
                      {formatInvoiceAmount(line.insurer_due)}
                    </td>
                    <td className="px-4 py-3 text-sm text-brand-slate">
                      {formatInvoiceAmount(line.client_due)}
                    </td>
                    <td className="px-4 py-3">
                      <LineExcessBadge hasExcess={line.has_excess === true} />
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-brand-navy">
                      {formatInvoiceAmount(line.price_subtotal)}
                    </td>
                    <td className="px-2 py-3">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8 text-brand-muted"
                        aria-label={`View pricing breakdown for ${line.name}`}
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
        line={breakdownLine}
        capturedAt={invoice.invoice_date}
        open={breakdownLine != null}
        onOpenChange={(open) => {
          if (!open) {
            setBreakdownLine(null);
          }
        }}
      />
    </section>
  );
}
