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
import type { Invoice } from "@/features/invoices/types/invoice.types";
import {
  formatInvoiceAmount,
  formatInvoiceCustomer,
  formatInvoiceDate,
} from "@/features/invoices/utils/format-invoice";
import {
  formatInvoiceInsuranceLabel,
  formatInvoiceInsuranceNumber,
} from "@/features/invoices/utils/format-invoice-insurance";
import { formatInvoiceStateLabel } from "@/features/invoices/utils/invoice-status";
import { formatInvoicePaymentStatusLabel } from "@/features/invoices/utils/invoice-payment-status";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

type InvoiceSummaryPanelProps = {
  invoice: Invoice;
  className?: string;
};

export function InvoiceSummaryPanel({
  invoice,
  className,
}: InvoiceSummaryPanelProps) {
  const insuranceLabel = formatInvoiceInsuranceLabel(invoice);
  const insuranceNumber = formatInvoiceInsuranceNumber(invoice);
  const hasInsuranceDetails =
    insuranceLabel !== "—" || insuranceNumber !== "—";

  return (
    <DetailPageAsidePanelSection className={cn(className)}>
      <DetailPageAsidePanelHeader
        title="Invoice summary"
        description="Billing totals and invoice details"
      />

      <DetailPageAsideSummaryHighlight title="Billing summary">
        <dl className="space-y-2.5">
          <DetailPageAsideSummaryAmountRow
            label="Gross amount"
            value={formatInvoiceAmount(invoice.amount_untaxed)}
          />
          <DetailPageAsideSummaryAmountRow
            label="Tax"
            value={formatInvoiceAmount(invoice.amount_tax)}
          />
          <DetailPageAsideSummaryAmountRow
            label="Total"
            value={formatInvoiceAmount(invoice.amount_total)}
            emphasized
          />
          <DetailPageAsideSummaryAmountRow
            label="Paid"
            value={formatInvoiceAmount(invoice.amount_paid)}
          />
          <DetailPageAsideSummaryAmountRow
            label="Balance"
            value={formatInvoiceAmount(invoice.amount_residual)}
          />
        </dl>
      </DetailPageAsideSummaryHighlight>

      <DetailPageAsideSummarySection title="Invoice details">
        <DetailPageAsideSummaryField
          label="Payment status"
          value={formatInvoicePaymentStatusLabel(invoice.payment_status)}
        />
        <DetailPageAsideSummaryField
          label="State"
          value={formatInvoiceStateLabel(invoice.state)}
        />
        <DetailPageAsideSummaryField
          label="Client"
          value={formatInvoiceCustomer(invoice)}
        />
        <DetailPageAsideSummaryField
          label="Invoice date"
          value={formatInvoiceDate(invoice.invoice_date)}
        />
        {invoice.sales_order_id ? (
          <DetailPageAsideSummaryField
            label="Sales order"
            value={
              <Link
                href={ROUTES.salesOrderDetail(invoice.sales_order_id)}
                className="text-brand-primary hover:underline"
              >
                {invoice.sales_order_name || `#${invoice.sales_order_id}`}
              </Link>
            }
          />
        ) : null}
        {invoice.invoice_origin ? (
          <DetailPageAsideSummaryField
            label="Origin"
            value={invoice.invoice_origin}
          />
        ) : null}
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
        {invoice.authorization_number ? (
          <DetailPageAsideSummaryField
            label="Authorization"
            value={invoice.authorization_number}
          />
        ) : null}
      </DetailPageAsideSummarySection>
    </DetailPageAsidePanelSection>
  );
}
