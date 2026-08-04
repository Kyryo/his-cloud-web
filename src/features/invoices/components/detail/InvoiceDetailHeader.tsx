"use client";

import type { ReactNode } from "react";

import { isInsuranceInvoice } from "@/features/claims/services/claims.service";
import { InvoiceStatusBadge } from "@/features/invoices/components/InvoiceStatusBadge";
import type { Invoice } from "@/features/invoices/types/invoice.types";
import {
  formatInvoiceCustomer,
  formatInvoiceDate,
} from "@/features/invoices/utils/format-invoice";
import { formatInvoicePaymentStatusLabel } from "@/features/invoices/utils/invoice-payment-status";
import { DetailPageHeaderSection } from "@/features/app-shell/components/page-layout";

type InvoiceDetailHeaderProps = {
  invoice: Invoice;
  actions?: ReactNode;
};

function formatClaimStatusMeta(status: Invoice["claim_status"]): string {
  if (!status) {
    return "Claim not started";
  }
  const normalized = String(status).toLowerCase();
  if (normalized === "draft") return "Claim draft";
  if (normalized === "submitted") return "Claim submitted";
  if (normalized === "approved") return "Claim approved";
  if (normalized === "rejected") return "Claim rejected";
  if (normalized === "cancelled") return "Claim cancelled";
  return `Claim ${normalized.replace(/_/g, " ")}`;
}

export function InvoiceDetailHeader({ invoice, actions }: InvoiceDetailHeaderProps) {
  const invoiceLabel = invoice.name || `Invoice #${invoice.id}`;
  const customerName = formatInvoiceCustomer(invoice);
  const showClaimMeta = isInsuranceInvoice(invoice);
  const paymentLabel = invoice.payment_status
    ? formatInvoicePaymentStatusLabel(invoice.payment_status)
    : null;
  const claimLabel = showClaimMeta
    ? formatClaimStatusMeta(invoice.claim_status)
    : null;
  const secondaryParts = [paymentLabel, claimLabel].filter(Boolean);

  return (
    <DetailPageHeaderSection>
      <div className="flex flex-wrap items-start justify-between gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="truncate text-lg font-semibold text-brand-navy sm:text-xl">
              {customerName}
            </h1>
            <InvoiceStatusBadge state={invoice.state} />
          </div>

          <p className="mt-1 font-mono text-sm text-brand-muted">{invoiceLabel}</p>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-brand-muted">
            <span>Invoiced {formatInvoiceDate(invoice.invoice_date)}</span>
            {secondaryParts.length > 0 ? (
              <>
                <span aria-hidden="true" className="text-brand-border">
                  ·
                </span>
                <span data-testid="invoice-header-secondary-status">
                  {secondaryParts.join(" · ")}
                </span>
              </>
            ) : null}
          </div>
        </div>

        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
        ) : null}
      </div>
    </DetailPageHeaderSection>
  );
}
