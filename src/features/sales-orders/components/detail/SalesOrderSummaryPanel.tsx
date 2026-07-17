"use client";

import Link from "next/link";
import { useState } from "react";

import { EditButton } from "@/components/ui/edit-button";
import {
  DetailPageAsidePanelHeader,
  DetailPageAsidePanelSection,
  DetailPageAsideSummaryAmountRow,
  DetailPageAsideSummaryField,
  DetailPageAsideSummaryHighlight,
  DetailPageAsideSummarySection,
} from "@/features/app-shell/components/page-layout";
import { AdjustBillingSplitDialog } from "@/features/sales-orders/components/detail/AdjustBillingSplitDialog";
import { updateSalesOrderPaymentSplit } from "@/features/sales-orders/services/sales-orders.service";
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
import {
  canEditSalesOrderLines,
  formatSalesOrderStateLabel,
} from "@/features/sales-orders/utils/sales-order-status";
import {
  formatSalesOrderInsurerDueLabel,
  hasSalesOrderPaymentSplit,
  sumSalesOrderClientDue,
  sumSalesOrderInsurerDue,
} from "@/features/sales-orders/utils/sum-sales-order-billing";
import { ROUTES } from "@/constants/routes";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage } from "@/lib/bff-field-errors";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

type SalesOrderSummaryPanelProps = {
  order: SalesOrder;
  className?: string;
  onOrderUpdated?: (order: SalesOrder) => void;
};

export function SalesOrderSummaryPanel({
  order,
  className,
  onOrderUpdated,
}: SalesOrderSummaryPanelProps) {
  const { toast } = useToast();
  const [editSplitOpen, setEditSplitOpen] = useState(false);
  const [isSavingSplit, setIsSavingSplit] = useState(false);

  const currency = formatSalesOrderCurrency(order);
  const insuranceLabel = formatSalesOrderInsuranceLabel(order);
  const insuranceNumber = formatSalesOrderInsuranceNumber(order);
  const hasInsuranceDetails =
    insuranceLabel !== "—" || insuranceNumber !== "—";
  const insurerDueTotal = sumSalesOrderInsurerDue(order);
  const clientDueTotal = sumSalesOrderClientDue(order);
  const showPaymentSplit = hasSalesOrderPaymentSplit(order);
  const canEditSplit = showPaymentSplit && canEditSalesOrderLines(order.state);
  const insurerDueLabel = formatSalesOrderInsurerDueLabel(order);

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

  async function handleSaveSplit(values: {
    client_due: string;
    insurer_due: string;
  }): Promise<boolean> {
    setIsSavingSplit(true);
    try {
      const updatedOrder = await updateSalesOrderPaymentSplit(order.id, values);
      onOrderUpdated?.(updatedOrder);
      toast({
        variant: "success",
        title: "Billing summary updated",
        description: "The payer and client amounts were saved.",
      });
      return true;
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not update billing summary",
        description:
          error instanceof BffError
            ? formatBffErrorMessage(error.message, error.errors)
            : error instanceof Error
              ? error.message
              : "The payment split could not be saved.",
      });
      return false;
    } finally {
      setIsSavingSplit(false);
    }
  }

  return (
    <DetailPageAsidePanelSection className={cn(className)}>
      <DetailPageAsidePanelHeader
        title="Order summary"
        description="Billing totals and order details"
      />

      <DetailPageAsideSummaryHighlight
        title="Billing summary"
        action={
          canEditSplit ? (
            <EditButton
              label="Edit"
              onClick={() => setEditSplitOpen(true)}
              data-testid="sales-order-billing-summary-edit-button"
            />
          ) : null
        }
      >
        <dl className="space-y-2.5">
          {showPaymentSplit ? (
            <>
              <DetailPageAsideSummaryAmountRow
                label={insurerDueLabel}
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

      <AdjustBillingSplitDialog
        open={editSplitOpen}
        isSaving={isSavingSplit}
        orderTotal={Number(order.amount_total) || 0}
        initialClientDue={clientDueTotal}
        initialInsurerDue={insurerDueTotal}
        insurerLabel={insurerDueLabel}
        onOpenChange={setEditSplitOpen}
        onSave={handleSaveSplit}
      />
    </DetailPageAsidePanelSection>
  );
}
