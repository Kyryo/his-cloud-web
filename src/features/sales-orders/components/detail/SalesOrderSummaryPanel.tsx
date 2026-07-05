"use client";

import Link from "next/link";

import {
  DetailPageAsidePanelHeader,
  DetailPageAsidePanelSection,
  DetailPageAsideSummaryAmountRow,
  DetailPageAsideSummaryField,
  DetailPageAsideSummaryHighlight,
  DetailPageAsideSummarySection,
} from "@/features/app-shell/components/page-layout";
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
import { formatSalesOrderStateLabel } from "@/features/sales-orders/utils/sales-order-status";
import {
  formatSalesOrderInsurerDueLabel,
  hasSalesOrderPaymentSplit,
  sumSalesOrderClientDue,
  sumSalesOrderInsurerDue,
} from "@/features/sales-orders/utils/sum-sales-order-billing";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

type SalesOrderSummaryPanelProps = {
  order: SalesOrder;
  className?: string;
  onOrderUpdated?: (order: SalesOrder) => void;
};

export function SalesOrderSummaryPanel({
  order,
  className,
}: SalesOrderSummaryPanelProps) {
  const currency = formatSalesOrderCurrency(order);
  const insuranceLabel = formatSalesOrderInsuranceLabel(order);
  const insuranceNumber = formatSalesOrderInsuranceNumber(order);
  const hasInsuranceDetails =
    insuranceLabel !== "—" || insuranceNumber !== "—";
  const insurerDueTotal = sumSalesOrderInsurerDue(order);
  const clientDueTotal = sumSalesOrderClientDue(order);
  const showPaymentSplit = hasSalesOrderPaymentSplit(order);

  const providerValue = order.provider_name?.trim() ? (
    order.provider_has_user && order.provider_user_id ? (
      <Link
        href={ROUTES.settingsUserManagement}
        className="text-brand-primary hover:underline"
      >
        {order.provider_name}
      </Link>
    ) : (
      order.provider_name
    )
  ) : (
    "—"
  );

  return (
    <DetailPageAsidePanelSection className={cn(className)}>
      <DetailPageAsidePanelHeader
        title="Order summary"
        description="Billing totals and order details"
      />

      <DetailPageAsideSummaryHighlight title="Billing summary">
        <dl className="space-y-2.5">
          {showPaymentSplit ? (
            <>
              <DetailPageAsideSummaryAmountRow
                label={formatSalesOrderInsurerDueLabel(order)}
                value={formatSalesOrderAmount(insurerDueTotal)}
              />
              <DetailPageAsideSummaryAmountRow
                label="Client due"
                value={formatSalesOrderAmount(clientDueTotal)}
              />
              <div
                className="border-t border-brand-border pt-2.5"
                role="presentation"
              />
            </>
          ) : null}
          <DetailPageAsideSummaryAmountRow
            label="Gross amount"
            value={formatSalesOrderAmount(order.amount_untaxed)}
          />
          <DetailPageAsideSummaryAmountRow
            label="Tax"
            value={formatSalesOrderAmount(order.amount_tax)}
          />
          <DetailPageAsideSummaryAmountRow
            label="Total"
            value={formatSalesOrderAmount(order.amount_total, currency)}
            emphasized
          />
        </dl>
      </DetailPageAsideSummaryHighlight>

      <DetailPageAsideSummarySection title="Order details">
        <DetailPageAsideSummaryField
          label="State"
          value={formatSalesOrderStateLabel(order.state)}
        />
        <DetailPageAsideSummaryField
          label="Client"
          value={formatSalesOrderCustomer(order)}
        />
        <DetailPageAsideSummaryField
          label="Order date"
          value={formatSalesOrderDateTime(order.date_order)}
        />
        <DetailPageAsideSummaryField
          label="Clinic"
          value={formatSalesOrderClinicName(order)}
        />
        <DetailPageAsideSummaryField
          label="Pricelist"
          value={formatSalesOrderPricelist(order)}
        />
        <DetailPageAsideSummaryField label="Provider" value={providerValue} />
        {hasInsuranceDetails ? (
          <>
            <DetailPageAsideSummaryField label="Insurance" value={insuranceLabel} />
            {insuranceNumber !== "—" ? (
              <DetailPageAsideSummaryField
                label="Membership no."
                value={insuranceNumber}
              />
            ) : null}
          </>
        ) : null}
        {order.client_order_ref ? (
          <DetailPageAsideSummaryField
            label="Reference"
            value={order.client_order_ref}
          />
        ) : null}
        {order.validity_date ? (
          <DetailPageAsideSummaryField
            label="Validity"
            value={formatSalesOrderDate(order.validity_date)}
          />
        ) : null}
        {order.commitment_date ? (
          <DetailPageAsideSummaryField
            label="Delivery"
            value={formatSalesOrderDate(order.commitment_date)}
          />
        ) : null}
        {order.note?.trim() ? (
          <DetailPageAsideSummaryField
            label="Notes"
            value={
              <span className="whitespace-pre-wrap">{order.note}</span>
            }
          />
        ) : null}
      </DetailPageAsideSummarySection>
    </DetailPageAsidePanelSection>
  );
}
