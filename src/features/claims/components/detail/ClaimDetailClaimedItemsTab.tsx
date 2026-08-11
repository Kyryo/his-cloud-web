"use client";

import { FileText } from "lucide-react";
import Link from "next/link";

import { DetailTabEmptyState } from "@/components/detail/detail-tab-empty-state";
import { SecondaryButton } from "@/components/ui/app-buttons";
import type { ClaimDetail, ClaimLineItem } from "@/features/claims/types/claims.types";
import { formatAmountNumber } from "@/features/sales-orders/utils/format-sales-order";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

type ClaimDetailClaimedItemsTabProps = {
  claim: ClaimDetail;
  isActive: boolean;
};

function formatTariffCode(value: string | null | undefined): string {
  return value?.trim() ? value : "—";
}

function formatLineDate(value: string | null | undefined): string {
  if (!value) {
    return "—";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function lineTotal(line: ClaimLineItem): number {
  const unit = Number(line.unit_price);
  const qty = Number(line.quantity);
  if (Number.isNaN(unit) || Number.isNaN(qty)) {
    return 0;
  }
  return unit * qty;
}

export function ClaimDetailClaimedItemsTab({
  claim,
  isActive,
}: ClaimDetailClaimedItemsTabProps) {
  const claimInvoices = claim.claim_invoices ?? [];
  const lineItems = claimInvoices.flatMap((invoice) => invoice.line_items ?? []);
  const invoiceId = claim.invoice_id || claim.invoice || null;

  return (
    <section
      className={cn(!isActive && "hidden")}
      data-testid="claim-detail-claimed-items-tab"
    >
      {claimInvoices.length === 0 && lineItems.length === 0 ? (
        <DetailTabEmptyState
          icon={FileText}
          title="No claimed items"
          description="This claim has no claimed line items yet."
        />
      ) : (
        <div className="space-y-4">
          {claimInvoices.map((claimInvoice) => (
            <div
              key={claimInvoice.id}
              className="rounded-xl border border-brand-border bg-white"
            >
              <div className="border-b border-brand-border px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-semibold text-brand-navy">
                      Claimed items
                    </h3>
                    <p className="mt-0.5 text-xs text-brand-muted">
                      Line items submitted on this insurance claim.
                    </p>
                  </div>
                  {invoiceId ? (
                    <SecondaryButton asChild size="sm" className="px-4">
                      <Link href={ROUTES.invoiceDetail(invoiceId)}>
                        View invoice
                      </Link>
                    </SecondaryButton>
                  ) : null}
                </div>
              </div>

              {(claimInvoice.line_items?.length ?? 0) === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-brand-muted">
                  No line items on this claim invoice.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-brand-border bg-slate-50/80">
                        <th className="px-4 py-3 text-left text-sm font-medium text-brand-muted">
                          Code
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-brand-muted">
                          Qty
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-brand-muted">
                          Unit price (MWK)
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-brand-muted">
                          Total (MWK)
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-brand-muted">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-border">
                      {claimInvoice.line_items.map((line) => (
                        <tr key={line.id}>
                          <td className="px-4 py-3 text-sm font-mono text-brand-slate">
                            {formatTariffCode(line.tariff_code)}
                          </td>
                          <td className="px-4 py-3 text-right text-sm text-brand-slate">
                            {line.quantity}
                          </td>
                          <td className="px-4 py-3 text-right text-sm text-brand-slate">
                            {formatAmountNumber(line.unit_price)}
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-medium text-brand-navy">
                            {formatAmountNumber(lineTotal(line))}
                          </td>
                          <td className="px-4 py-3 text-sm text-brand-slate">
                            {formatLineDate(line.date_created)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
