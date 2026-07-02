"use client";

import type { ReactNode } from "react";

import { ClaimStatusBadge } from "@/features/claims/components/ClaimStatusBadge";
import { isInsuranceInvoice } from "@/features/claims/services/claims.service";
import { InvoicePaymentStatusBadge } from "@/features/invoices/components/InvoicePaymentStatusBadge";
import { InvoiceStatusBadge } from "@/features/invoices/components/InvoiceStatusBadge";
import type { Invoice } from "@/features/invoices/types/invoice.types";
import {
  formatInvoiceCustomer,
  formatInvoiceDate,
} from "@/features/invoices/utils/format-invoice";
import { DetailPageHeaderSection } from "@/features/app-shell/components/page-layout";

type InvoiceDetailHeaderProps = {
  invoice: Invoice;
  actions?: ReactNode;
};

export function InvoiceDetailHeader({ invoice, actions }: InvoiceDetailHeaderProps) {
  const invoiceLabel = invoice.name || `Invoice #${invoice.id}`;
  const customerName = formatInvoiceCustomer(invoice);
  const showClaimStatus = isInsuranceInvoice(invoice);

  return (
    <DetailPageHeaderSection>
      <div className="flex flex-wrap items-start justify-between gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="truncate text-lg font-semibold text-brand-navy sm:text-xl">
              {customerName}
            </h1>
            <InvoiceStatusBadge state={invoice.state} />
            {invoice.payment_status ? (
              <InvoicePaymentStatusBadge status={invoice.payment_status} />
            ) : null}
            {showClaimStatus ? (
              <ClaimStatusBadge status={invoice.claim_status} />
            ) : null}
          </div>

          <p className="mt-1 font-mono text-sm text-brand-muted">{invoiceLabel}</p>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-brand-muted">
            <span>Invoiced {formatInvoiceDate(invoice.invoice_date)}</span>
          </div>
        </div>

        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
        ) : null}
      </div>
    </DetailPageHeaderSection>
  );
}
