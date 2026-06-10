"use client";

import type { ReactNode } from "react";

import { DetailPageAsidePanelSection } from "@/features/app-shell/components/page-layout";
import type { SalesOrder } from "@/features/sales-orders/types/sales-order.types";
import {
  formatSalesOrderAmount,
  formatSalesOrderClinicName,
  formatSalesOrderCurrency,
  formatSalesOrderCustomer,
  formatSalesOrderDate,
  formatSalesOrderDateTime,
  formatSalesOrderPricelist,
} from "@/features/sales-orders/utils/format-sales-order";
import {
  formatSalesOrderInsuranceLabel,
  formatSalesOrderInsuranceNumber,
} from "@/features/sales-orders/utils/format-sales-order-insurance";
import { formatOdooRelation } from "@/features/sales-orders/utils/format-odoo-relation";
import { formatSalesOrderStateLabel } from "@/features/sales-orders/utils/sales-order-status";
import { cn } from "@/lib/utils";

type SalesOrderSummaryPanelProps = {
  order: SalesOrder;
  className?: string;
};

function SummaryField({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div>
      <dt className="text-xs text-brand-muted">{label}</dt>
      <dd className="mt-0.5 break-words text-sm font-semibold text-brand-navy">
        {value}
      </dd>
    </div>
  );
}

function SummarySection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="border-t border-brand-border pt-4">
      <h3 className="mb-3 text-[11px] font-semibold uppercase text-brand-muted">
        {title}
      </h3>
      <dl className="space-y-3">{children}</dl>
    </div>
  );
}

function BillingAmountRow({
  label,
  value,
  emphasized = false,
}: {
  label: string;
  value: string;
  emphasized?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <dt className={emphasized ? "font-medium text-brand-navy" : "text-brand-muted"}>
        {label}
      </dt>
      <dd
        className={
          emphasized
            ? "font-semibold text-brand-navy"
            : "font-medium text-brand-navy"
        }
      >
        {value}
      </dd>
    </div>
  );
}

export function SalesOrderSummaryPanel({
  order,
  className,
}: SalesOrderSummaryPanelProps) {
  const currency = formatSalesOrderCurrency(order);
  const insuranceLabel = formatSalesOrderInsuranceLabel(order);
  const insuranceNumber = formatSalesOrderInsuranceNumber(order);
  const hasInsuranceDetails =
    insuranceLabel !== "—" || insuranceNumber !== "—";

  return (
    <DetailPageAsidePanelSection className={cn(className)}>
      <div className="rounded-xl border border-brand-border bg-slate-50/60 p-4">
        <h2 className="text-[11px] font-semibold uppercase text-brand-muted">
          Billing summary
        </h2>
        <dl className="mt-3 space-y-2.5">
          <BillingAmountRow
            label="Gross amount"
            value={formatSalesOrderAmount(order.amount_untaxed, currency)}
          />
          <BillingAmountRow
            label="Tax"
            value={formatSalesOrderAmount(order.amount_tax, currency)}
          />
          <BillingAmountRow
            label="Total"
            value={formatSalesOrderAmount(order.amount_total, currency)}
            emphasized
          />
        </dl>
      </div>

      <SummarySection title="Order summary">
        <SummaryField
          label="State"
          value={formatSalesOrderStateLabel(order.state)}
        />
        <SummaryField label="Client" value={formatSalesOrderCustomer(order)} />
        <SummaryField
          label="Order date"
          value={formatSalesOrderDateTime(order.date_order)}
        />
        <SummaryField
          label="Clinic"
          value={formatSalesOrderClinicName(order)}
        />
        <SummaryField
          label="Pricelist"
          value={formatSalesOrderPricelist(order)}
        />
        <SummaryField
          label="Salesperson"
          value={formatOdooRelation(order.user_id)}
        />
        <SummaryField
          label="Company"
          value={formatOdooRelation(order.company_id)}
        />
        <SummaryField
          label="Payment terms"
          value={formatOdooRelation(order.payment_term_id)}
        />
        {hasInsuranceDetails ? (
          <>
            <SummaryField label="Insurance" value={insuranceLabel} />
            {insuranceNumber !== "—" ? (
              <SummaryField label="Membership no." value={insuranceNumber} />
            ) : null}
          </>
        ) : null}
        {order.client_order_ref ? (
          <SummaryField label="Reference" value={order.client_order_ref} />
        ) : null}
        {order.validity_date ? (
          <SummaryField
            label="Validity"
            value={formatSalesOrderDate(order.validity_date)}
          />
        ) : null}
        {order.commitment_date ? (
          <SummaryField
            label="Delivery"
            value={formatSalesOrderDate(order.commitment_date)}
          />
        ) : null}
        {order.note?.trim() ? (
          <SummaryField
            label="Notes"
            value={
              <span className="whitespace-pre-wrap font-normal text-brand-slate">
                {order.note}
              </span>
            }
          />
        ) : null}
      </SummarySection>
    </DetailPageAsidePanelSection>
  );
}
