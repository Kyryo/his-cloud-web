"use client";

import { DetailPageAsidePanelSection } from "@/features/app-shell/components/page-layout";
import type { SalesOrder } from "@/features/sales-orders/types/sales-order.types";
import {
  formatSalesOrderAmount,
  formatSalesOrderCurrency,
  formatSalesOrderDate,
} from "@/features/sales-orders/utils/format-sales-order";
import { formatOdooRelation, getOdooRelationId } from "@/features/sales-orders/utils/format-odoo-relation";
import { cn } from "@/lib/utils";

type SalesOrderSummaryPanelProps = {
  order: SalesOrder;
  className?: string;
};

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <dt className="text-brand-muted">{label}</dt>
      <dd className="text-right font-medium text-brand-navy">{value}</dd>
    </div>
  );
}

export function SalesOrderSummaryPanel({
  order,
  className,
}: SalesOrderSummaryPanelProps) {
  const currency = formatSalesOrderCurrency(order);
  const visitId = getOdooRelationId(order.x_visit_id);

  return (
    <DetailPageAsidePanelSection className={cn(className)}>
      <div>
        <h2 className="text-sm font-semibold text-brand-navy">Order summary</h2>
        <p className="mt-1 text-xs text-brand-muted">
          Key billing details from ERP.
        </p>
      </div>

      <dl className="space-y-3 rounded-xl border border-brand-border bg-slate-50/60 p-4">
        <SummaryRow
          label="Untaxed"
          value={formatSalesOrderAmount(order.amount_untaxed, currency)}
        />
        <SummaryRow
          label="Tax"
          value={formatSalesOrderAmount(order.amount_tax, currency)}
        />
        <SummaryRow
          label="Total"
          value={formatSalesOrderAmount(order.amount_total, currency)}
        />
        <SummaryRow
          label="Pricelist"
          value={formatOdooRelation(order.pricelist_id)}
        />
        <SummaryRow
          label="Salesperson"
          value={formatOdooRelation(order.user_id)}
        />
        {visitId ? (
          <SummaryRow label="Visit" value={`#${visitId}`} />
        ) : null}
        {order.validity_date ? (
          <SummaryRow
            label="Validity"
            value={formatSalesOrderDate(order.validity_date)}
          />
        ) : null}
      </dl>
    </DetailPageAsidePanelSection>
  );
}
