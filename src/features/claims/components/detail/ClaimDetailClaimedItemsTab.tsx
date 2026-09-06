"use client";

import { FileText } from "lucide-react";
import Link from "next/link";

import { DetailTabEmptyState } from "@/components/detail/detail-tab-empty-state";
import { SecondaryButton } from "@/components/ui/app-buttons";
import {
  ListPageDataTable,
  ListPageDataTableBody,
  ListPageDataTableCell,
  ListPageDataTableHeader,
  ListPageDataTableHeaderCell,
  ListPageDataTableHeaderRow,
  ListPageDataTableRow,
} from "@/features/app-shell/components/page-layout";
import {
  LineRemittanceSettlementBadge,
  shouldShowRemittanceSettlementBadge,
} from "@/features/claims/components/LineRemittanceSettlementBadge";
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

function formatLineName(line: ClaimLineItem): string {
  return line.description?.trim() ? line.description.trim() : "—";
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
  const invoiceRef =
    claim.invoice_uuid ?? claim.invoice_id ?? claim.invoice ?? null;

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
        <div className="space-y-6">
          {claimInvoices.map((claimInvoice) => (
            <div key={claimInvoice.id} className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-brand-navy">
                    Claimed items
                  </h3>
                  <p className="mt-0.5 text-xs text-brand-muted">
                    Line items submitted on this insurance claim.
                  </p>
                </div>
                {invoiceRef ? (
                  <SecondaryButton asChild size="sm" className="px-4">
                    <Link href={ROUTES.invoiceDetail(invoiceRef)}>
                      View invoice
                    </Link>
                  </SecondaryButton>
                ) : null}
              </div>

              {(claimInvoice.line_items?.length ?? 0) === 0 ? (
                <p className="py-8 text-center text-sm text-brand-muted">
                  No line items on this claim invoice.
                </p>
              ) : (
                <ListPageDataTable>
                  <ListPageDataTableHeader>
                    <ListPageDataTableHeaderRow>
                      <ListPageDataTableHeaderCell>Date</ListPageDataTableHeaderCell>
                      <ListPageDataTableHeaderCell>
                        Product
                      </ListPageDataTableHeaderCell>
                      <ListPageDataTableHeaderCell>Code</ListPageDataTableHeaderCell>
                      <ListPageDataTableHeaderCell className="text-right">
                        Qty
                      </ListPageDataTableHeaderCell>
                      <ListPageDataTableHeaderCell className="text-right">
                        Unit price (MWK)
                      </ListPageDataTableHeaderCell>
                      <ListPageDataTableHeaderCell className="text-right">
                        Total (MWK)
                      </ListPageDataTableHeaderCell>
                      <ListPageDataTableHeaderCell>
                        <span className="sr-only">Remittance</span>
                      </ListPageDataTableHeaderCell>
                    </ListPageDataTableHeaderRow>
                  </ListPageDataTableHeader>
                  <ListPageDataTableBody>
                    {claimInvoice.line_items.map((line) => (
                      <ListPageDataTableRow key={line.id}>
                        <ListPageDataTableCell>
                          {formatLineDate(line.date_created)}
                        </ListPageDataTableCell>
                        <ListPageDataTableCell className="font-medium text-brand-navy">
                          {formatLineName(line)}
                        </ListPageDataTableCell>
                        <ListPageDataTableCell className="font-mono">
                          {formatTariffCode(line.tariff_code)}
                        </ListPageDataTableCell>
                        <ListPageDataTableCell className="text-right">
                          {line.quantity}
                        </ListPageDataTableCell>
                        <ListPageDataTableCell className="text-right">
                          {formatAmountNumber(line.unit_price)}
                        </ListPageDataTableCell>
                        <ListPageDataTableCell className="text-right font-medium text-brand-navy">
                          {formatAmountNumber(lineTotal(line))}
                        </ListPageDataTableCell>
                        <ListPageDataTableCell>
                          {shouldShowRemittanceSettlementBadge(
                            line.remittance_settlement_status,
                          ) ? (
                            <LineRemittanceSettlementBadge
                              status={line.remittance_settlement_status}
                            />
                          ) : null}
                        </ListPageDataTableCell>
                      </ListPageDataTableRow>
                    ))}
                  </ListPageDataTableBody>
                </ListPageDataTable>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
