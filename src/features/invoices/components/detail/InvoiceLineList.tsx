import { Maximize2 } from "lucide-react";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ListPageDataTable,
  ListPageDataTableBody,
  ListPageDataTableCell,
  ListPageDataTableHeader,
  ListPageDataTableHeaderCell,
  ListPageDataTableHeaderRow,
  ListPageDataTableRow,
} from "@/features/app-shell/components/page-layout";
import { isInsuranceInvoice } from "@/features/claims/services/claims.service";
import {
  LineRemittanceSettlementBadge,
  shouldShowRemittanceSettlementBadge,
} from "@/features/claims/components/LineRemittanceSettlementBadge";
import type { Invoice, InvoiceLine } from "@/features/invoices/types/invoice.types";
import { formatInvoiceAmount } from "@/features/invoices/utils/format-invoice";
import { isInvoiceLineNonPayable } from "@/features/invoices/utils/invoice-line-payability";
import { LineNonPayableBadge } from "@/features/sales-orders/components/detail/LineNonPayableBadge";
import { formatAmountNumber } from "@/features/sales-orders/utils/format-sales-order";

function formatQuantity(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  const quantity = Number(value);
  if (!Number.isFinite(quantity)) {
    return String(value);
  }

  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 2,
  }).format(quantity);
}

function formatTariffCode(value: string | null | undefined): string {
  const trimmed = value?.trim();
  return trimmed || "—";
}

type InvoiceLineListProps = {
  invoice: Invoice;
  onViewDetails: (line: InvoiceLine) => void;
};

export function InvoiceLineList({
  invoice,
  onViewDetails,
}: InvoiceLineListProps) {
  const lines = invoice.lines ?? [];
  const showNonPayableBadges = isInsuranceInvoice(invoice);
  const payableCount = lines.filter((line) => !isInvoiceLineNonPayable(line)).length;

  return (
    <div className="space-y-4" data-testid="invoice-lines-list">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-brand-navy">
            Line items ({lines.length})
          </h2>
          <p className="text-xs text-brand-muted">
            Services, medications, and clinical billables
          </p>
        </div>
        <div className="flex items-center gap-2">
          {showNonPayableBadges && payableCount > 0 ? (
            <Badge variant="success" className="font-normal text-xs">
              {payableCount} payable
            </Badge>
          ) : null}
          <span className="text-sm font-semibold tabular-nums text-brand-navy">
            {formatInvoiceAmount(invoice.amount_total)}
          </span>
        </div>
      </div>

      <ListPageDataTable>
        <ListPageDataTableHeader>
          <ListPageDataTableHeaderRow>
            <ListPageDataTableHeaderCell>Item</ListPageDataTableHeaderCell>
            <ListPageDataTableHeaderCell>Tariff</ListPageDataTableHeaderCell>
            <ListPageDataTableHeaderCell className="text-right">
              Qty
            </ListPageDataTableHeaderCell>
            <ListPageDataTableHeaderCell className="text-right">
              Price
            </ListPageDataTableHeaderCell>
            <ListPageDataTableHeaderCell className="text-right">
              Total
            </ListPageDataTableHeaderCell>
            <ListPageDataTableHeaderCell className="w-12 pr-4">
              <span className="sr-only">Actions</span>
            </ListPageDataTableHeaderCell>
          </ListPageDataTableHeaderRow>
        </ListPageDataTableHeader>
        <ListPageDataTableBody>
          {lines.map((line) => (
              <ListPageDataTableRow key={line.id}>
                <ListPageDataTableCell className="py-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onViewDetails(line)}
                      className="text-left text-sm font-medium text-brand-navy hover:text-brand-primary"
                    >
                      {line.name}
                    </button>
                    {showNonPayableBadges && isInvoiceLineNonPayable(line) ? (
                      <LineNonPayableBadge />
                    ) : showNonPayableBadges ? (
                      <Badge variant="success" className="font-normal">
                        Payable
                      </Badge>
                    ) : null}
                    {shouldShowRemittanceSettlementBadge(
                      line.remittance_settlement_status,
                    ) ? (
                      <LineRemittanceSettlementBadge
                        status={line.remittance_settlement_status}
                      />
                    ) : null}
                  </div>
                </ListPageDataTableCell>
                <ListPageDataTableCell className="py-3 font-mono text-xs text-brand-slate">
                  {formatTariffCode(line.tariff_code)}
                </ListPageDataTableCell>
                <ListPageDataTableCell className="py-3 text-right tabular-nums">
                  {formatQuantity(line.quantity)}
                </ListPageDataTableCell>
                <ListPageDataTableCell className="py-3 text-right tabular-nums">
                  {formatAmountNumber(line.price_unit)}
                </ListPageDataTableCell>
                <ListPageDataTableCell className="py-3 text-right font-semibold tabular-nums text-brand-navy">
                  {formatInvoiceAmount(line.price_total)}
                </ListPageDataTableCell>
                <ListPageDataTableCell className="py-3 pr-4">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8 text-brand-muted hover:text-brand-navy"
                    aria-label={`View details for ${line.name}`}
                    onClick={() => onViewDetails(line)}
                  >
                    <Maximize2 className="size-4" aria-hidden="true" />
                  </Button>
                </ListPageDataTableCell>
              </ListPageDataTableRow>
            ))}
        </ListPageDataTableBody>
      </ListPageDataTable>
    </div>
  );
}

export function InvoiceLineListEmpty({ children }: { children: ReactNode }) {
  return <p className="text-sm text-brand-muted">{children}</p>;
}
