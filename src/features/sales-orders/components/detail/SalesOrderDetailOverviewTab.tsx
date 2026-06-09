"use client";

import type { SalesOrder } from "@/features/sales-orders/types/sales-order.types";
import {
  formatSalesOrderAmount,
  formatSalesOrderCurrency,
  formatSalesOrderCustomer,
  formatSalesOrderDate,
  formatSalesOrderDateTime,
} from "@/features/sales-orders/utils/format-sales-order";
import { formatOdooRelation, getOdooRelationId } from "@/features/sales-orders/utils/format-odoo-relation";
import {
  formatSalesOrderInvoiceStatusLabel,
  formatSalesOrderStateLabel,
} from "@/features/sales-orders/utils/sales-order-status";
import { cn } from "@/lib/utils";

type SalesOrderDetailOverviewTabProps = {
  order: SalesOrder;
  isActive: boolean;
};

function DetailField({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1", className)}>
      <dt className="text-xs font-medium uppercase tracking-wide text-brand-muted">
        {label}
      </dt>
      <dd className="text-sm text-brand-navy">{value}</dd>
    </div>
  );
}

export function SalesOrderDetailOverviewTab({
  order,
  isActive,
}: SalesOrderDetailOverviewTabProps) {
  if (!isActive) {
    return null;
  }

  const currency = formatSalesOrderCurrency(order);
  const visitId = getOdooRelationId(order.x_visit_id);

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-brand-border bg-white p-5 sm:p-6">
        <h2 className="text-sm font-semibold text-brand-navy">Order information</h2>
        <dl className="mt-4 grid gap-5 sm:grid-cols-2">
          <DetailField label="Order number" value={order.name || `#${order.id}`} />
          <DetailField label="ERP ID" value={`#${order.id}`} />
          <DetailField label="Customer" value={formatSalesOrderCustomer(order)} />
          <DetailField
            label="Order date"
            value={formatSalesOrderDateTime(order.date_order)}
          />
          <DetailField label="State" value={formatSalesOrderStateLabel(order.state)} />
          <DetailField
            label="Invoice status"
            value={formatSalesOrderInvoiceStatusLabel(order.invoice_status)}
          />
          <DetailField label="Pricelist" value={formatOdooRelation(order.pricelist_id)} />
          <DetailField label="Salesperson" value={formatOdooRelation(order.user_id)} />
          <DetailField label="Company" value={formatOdooRelation(order.company_id)} />
          <DetailField
            label="Payment terms"
            value={formatOdooRelation(order.payment_term_id)}
          />
          {visitId ? (
            <DetailField label="Visit" value={`#${visitId}`} />
          ) : null}
          {order.client_order_ref ? (
            <DetailField label="Customer reference" value={order.client_order_ref} />
          ) : null}
          {order.validity_date ? (
            <DetailField
              label="Validity date"
              value={formatSalesOrderDate(order.validity_date)}
            />
          ) : null}
          {order.commitment_date ? (
            <DetailField
              label="Delivery date"
              value={formatSalesOrderDate(order.commitment_date)}
            />
          ) : null}
        </dl>
      </section>

      <section className="rounded-xl border border-brand-border bg-white p-5 sm:p-6">
        <h2 className="text-sm font-semibold text-brand-navy">Amounts</h2>
        <dl className="mt-4 grid gap-5 sm:grid-cols-3">
          <DetailField
            label="Untaxed"
            value={formatSalesOrderAmount(order.amount_untaxed, currency)}
          />
          <DetailField
            label="Tax"
            value={formatSalesOrderAmount(order.amount_tax, currency)}
          />
          <DetailField
            label="Total"
            value={formatSalesOrderAmount(order.amount_total, currency)}
          />
        </dl>
      </section>

      {order.note?.trim() ? (
        <section className="rounded-xl border border-brand-border bg-white p-5 sm:p-6">
          <h2 className="text-sm font-semibold text-brand-navy">Notes</h2>
          <p className="mt-3 whitespace-pre-wrap text-sm text-brand-slate">
            {order.note}
          </p>
        </section>
      ) : null}
    </div>
  );
}
