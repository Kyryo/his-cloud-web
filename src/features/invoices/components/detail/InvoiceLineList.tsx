import { Maximize2 } from "lucide-react";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { isInsuranceInvoice } from "@/features/claims/services/claims.service";
import {
  LineRemittanceSettlementBadge,
  shouldShowRemittanceSettlementBadge,
} from "@/features/claims/components/LineRemittanceSettlementBadge";
import type { Invoice, InvoiceLine } from "@/features/invoices/types/invoice.types";
import { formatInvoiceAmount } from "@/features/invoices/utils/format-invoice";
import { isInvoiceLineNonPayable } from "@/features/invoices/utils/invoice-line-payability";
import { LineNonPayableBadge } from "@/features/sales-orders/components/detail/LineNonPayableBadge";
import { hasLinePaymentSplit } from "@/features/sales-orders/types/line-payment-split.types";
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

function formatTariffCode(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed || null;
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
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-dash-border/80 pb-3">
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

      <ul className="divide-y divide-dash-border/60" data-testid="invoice-lines-list">
        {lines.map((line) => {
          const tariffCode = formatTariffCode(line.tariff_code);
          const showSplit = hasLinePaymentSplit(line);

          return (
            <li
              key={line.id}
              className="flex items-start justify-between gap-3 py-3.5 first:pt-0"
            >
              <div className="min-w-0 flex-1">
                <button
                  type="button"
                  onClick={() => onViewDetails(line)}
                  className="text-left text-sm font-medium text-brand-navy hover:text-brand-primary"
                >
                  {line.name}
                </button>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  {tariffCode ? (
                    <Badge variant="outline" className="font-mono font-normal">
                      {tariffCode}
                    </Badge>
                  ) : null}
                  <Badge variant="secondary" className="font-normal">
                    ×{formatQuantity(line.quantity)}
                  </Badge>
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
                  {showSplit ? (
                    <>
                      <Badge variant="secondary" className="font-normal">
                        Insurer {formatAmountNumber(line.insurer_due)}
                      </Badge>
                      <Badge variant="outline" className="font-normal">
                        Client {formatAmountNumber(line.client_due)}
                      </Badge>
                    </>
                  ) : null}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <p className="text-sm font-semibold tabular-nums text-brand-navy">
                  {formatInvoiceAmount(line.price_total)}
                </p>
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
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function InvoiceLineListEmpty({ children }: { children: ReactNode }) {
  return <p className="text-sm text-brand-muted">{children}</p>;
}
