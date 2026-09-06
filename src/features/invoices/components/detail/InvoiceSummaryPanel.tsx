"use client";

import Link from "next/link";
import { Shield } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  DetailPageAsidePanelHeader,
  DetailPageAsidePanelSection,
  DetailPageAsideSummaryAmountRow,
  DetailPageAsideSummaryField,
  DetailPageAsideSummarySection,
  DetailPageAsideSummaryTotalRow,
} from "@/features/app-shell/components/page-layout";
import type { Invoice } from "@/features/invoices/types/invoice.types";
import {
  formatInvoiceAmount,
  formatInvoiceCustomer,
  formatInvoiceDate,
  formatInvoicePricelist,
} from "@/features/invoices/utils/format-invoice";
import {
  formatInvoiceInsuranceLabel,
  formatInvoiceInsuranceNumber,
} from "@/features/invoices/utils/format-invoice-insurance";
import {
  formatInvoiceInsurerDueLabel,
  getInvoiceOutstandingBalance,
  hasInvoiceBalance,
  hasInvoicePaymentSplit,
  sumInvoiceClientDue,
  sumInvoiceExcess,
  sumInvoiceInsurerDue,
} from "@/features/invoices/utils/sum-invoice-billing";
import { collectInvoicePaymentRules } from "@/features/invoices/utils/collect-invoice-payment-rules";
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
  const insurerDueTotal = sumInvoiceInsurerDue(invoice);
  const clientDueTotal = sumInvoiceClientDue(invoice);
  const excessTotal = sumInvoiceExcess(invoice);
  const showPaymentSplit = hasInvoicePaymentSplit(invoice);
  const showExcess = excessTotal > 0;
  const paymentRules = collectInvoicePaymentRules(invoice.lines);
  const hasBalance = hasInvoiceBalance(invoice);
  const balanceAmount = getInvoiceOutstandingBalance(invoice);

  return (
    <DetailPageAsidePanelSection className={cn(className)}>
      <DetailPageAsidePanelHeader
        title="Invoice summary"
        description="Billing totals and invoice details"
      />

      <div data-testid="invoice-summary-stats">
        <DetailPageAsideSummarySection title="Totals" className="border-t-0 pt-0">
          <DetailPageAsideSummaryField
            label="Total"
            value={formatInvoiceAmount(invoice.amount_total)}
          />
          <DetailPageAsideSummaryField
            label="Paid"
            value={formatInvoiceAmount(invoice.amount_paid)}
          />
          <DetailPageAsideSummaryField
            label="Balance"
            value={
              <span className={hasBalance ? "text-red-600" : undefined}>
                {formatInvoiceAmount(balanceAmount)}
              </span>
            }
          />
        </DetailPageAsideSummarySection>
      </div>

      <DetailPageAsideSummarySection title="Billing">
        {showPaymentSplit ? (
          <>
            <DetailPageAsideSummaryAmountRow
              label={formatInvoiceInsurerDueLabel(invoice)}
              value={formatInvoiceAmount(insurerDueTotal)}
            />
            <DetailPageAsideSummaryAmountRow
              label="Client due"
              value={formatInvoiceAmount(clientDueTotal)}
            />
            {showExcess ? (
              <DetailPageAsideSummaryAmountRow
                label="Excess"
                value={formatInvoiceAmount(excessTotal)}
              />
            ) : null}
            <div className="border-t border-dash-border/80 pt-2" role="presentation" />
          </>
        ) : null}
        <DetailPageAsideSummaryAmountRow
          label="Gross amount"
          value={formatInvoiceAmount(invoice.amount_untaxed)}
        />
        <DetailPageAsideSummaryAmountRow
          label="Tax"
          value={formatInvoiceAmount(invoice.amount_tax)}
        />
        <DetailPageAsideSummaryTotalRow
          value={formatInvoiceAmount(invoice.amount_total)}
          showDivider
        />
      </DetailPageAsideSummarySection>

      {/* Insurance & Coverage */}
      {hasInsuranceDetails ? (
        <DetailPageAsideSummarySection title="Coverage">
          <DetailPageAsideSummaryField
            label="Payer"
            value={
              <span className="inline-flex items-center gap-1.5 font-medium text-brand-navy">
                <Shield className="size-3.5 text-brand-primary" aria-hidden="true" />
                {insuranceLabel}
              </span>
            }
          />
          {insuranceNumber !== "—" ? (
            <DetailPageAsideSummaryField
              label="Membership no."
              value={
                <Badge variant="outline" className="font-mono font-normal">
                  {insuranceNumber}
                </Badge>
              }
            />
          ) : null}
          {invoice.authorization_number ? (
            <DetailPageAsideSummaryField
              label="Authorization"
              value={
                <Badge variant="outline" className="font-mono font-normal">
                  {invoice.authorization_number}
                </Badge>
              }
            />
          ) : null}
          {paymentRules.length > 0 ? (
            <DetailPageAsideSummaryField
              label="Payment rules"
              value={
                <div className="flex flex-wrap gap-1">
                  {paymentRules.map((rule) => (
                    <Badge
                      key={rule.key}
                      variant="secondary"
                      className="font-normal"
                      title={rule.ruleTypesLabel}
                    >
                      {rule.ruleName}
                    </Badge>
                  ))}
                </div>
              }
            />
          ) : null}
        </DetailPageAsideSummarySection>
      ) : null}

      {/* Invoice Details */}
      <DetailPageAsideSummarySection title="Details">
        <DetailPageAsideSummaryField
          label="Client"
          value={
            invoice.customer_uuid ? (
              <Link
                href={ROUTES.customerDetail(invoice.customer_uuid)}
                className="text-brand-primary hover:underline"
              >
                {formatInvoiceCustomer(invoice)}
              </Link>
            ) : (
              formatInvoiceCustomer(invoice)
            )
          }
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
                href={ROUTES.salesOrderDetail(
                  invoice.sales_order_uuid ?? invoice.sales_order_id,
                )}
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
        {invoice.internal_reference ? (
          <DetailPageAsideSummaryField
            label="Reference"
            value={
              <span className="font-mono text-xs">{invoice.internal_reference}</span>
            }
          />
        ) : null}
        <DetailPageAsideSummaryField
          label="Pricelist"
          value={formatInvoicePricelist(invoice)}
        />
        {!hasInsuranceDetails && paymentRules.length > 0 ? (
          <DetailPageAsideSummaryField
            label="Payment rules"
            value={paymentRules[0]?.ruleName ?? "List price"}
          />
        ) : null}
      </DetailPageAsideSummarySection>
    </DetailPageAsidePanelSection>
  );
}
