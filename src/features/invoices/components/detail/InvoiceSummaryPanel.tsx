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
  formatInvoicePricelist,
} from "@/features/invoices/utils/format-invoice";
import {
  formatInvoiceInsuranceLabel,
  formatInvoiceInsuranceNumber,
} from "@/features/invoices/utils/format-invoice-insurance";
import { formatInvoiceStateLabel } from "@/features/invoices/utils/invoice-status";
import { formatInvoicePaymentStatusLabel } from "@/features/invoices/utils/invoice-payment-status";
import {
  formatInvoiceInsurerDueLabel,
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

  return (
    <DetailPageAsidePanelSection className={cn(className)}>
      <DetailPageAsidePanelHeader
        title="Invoice summary"
        description="Billing totals and invoice details"
      />

      <DetailPageAsideSummaryHighlight title="Billing summary">
        <dl className="space-y-2.5">
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
              <div
                className="border-t border-brand-border pt-2.5"
                role="presentation"
              />
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
          <DetailPageAsideSummaryAmountRow
            label="Total"
            value={formatInvoiceAmount(invoice.amount_total)}
            emphasized
          />
        </dl>
      </DetailPageAsideSummaryHighlight>

      <div
        className={cn(
          "mt-3 rounded-xl border p-4",
          hasBalance
            ? "border-red-200 bg-red-50/70"
            : "border-brand-border bg-slate-50/60",
        )}
      >
        <dl className="space-y-2.5">
          <DetailPageAsideSummaryAmountRow
            label="Paid"
            value={formatInvoiceAmount(invoice.amount_paid)}
          />
          <DetailPageAsideSummaryAmountRow
            label="Balance"
            value={formatInvoiceAmount(invoice.amount_residual)}
            variant={hasBalance ? "danger" : "default"}
            emphasized={hasBalance}
          />
        </dl>
      </div>

      <DetailPageAsideSummarySection title="Pricing">
        <DetailPageAsideSummaryField
          label="Pricelist"
          value={formatInvoicePricelist(invoice)}
        />
        {paymentRules.length > 0 ? (
          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-wide text-brand-muted">
              Payment rules
            </p>
            <ul className="space-y-2">
              {paymentRules.map((rule) => (
                <li
                  key={rule.key}
                  className="rounded-lg border border-brand-border bg-slate-50/60 px-3 py-2"
                >
                  <p className="text-sm font-medium text-brand-navy">{rule.ruleName}</p>
                  <p className="mt-0.5 text-xs text-brand-muted">{rule.ruleTypesLabel}</p>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <DetailPageAsideSummaryField label="Payment rules" value="List price" />
        )}
      </DetailPageAsideSummarySection>

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
