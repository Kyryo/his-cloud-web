"use client";

import Link from "next/link";
import { Shield } from "lucide-react";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { ROUTES } from "@/constants/routes";
import { isInsuranceInvoice } from "@/features/claims/services/claims.service";
import { InvoicePaymentStatusBadge } from "@/features/invoices/components/InvoicePaymentStatusBadge";
import { InvoiceStatusBadge } from "@/features/invoices/components/InvoiceStatusBadge";
import type { Invoice } from "@/features/invoices/types/invoice.types";
import {
  formatInvoiceCustomer,
  formatInvoiceDate,
} from "@/features/invoices/utils/format-invoice";
import { formatInvoiceInsuranceLabel } from "@/features/invoices/utils/format-invoice-insurance";
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
  const isInsurance = isInsuranceInvoice(invoice);
  const insuranceLabel = formatInvoiceInsuranceLabel(invoice);
  const claimMeta = isInsurance ? formatClaimStatusMeta(invoice.claim_status) : null;

  return (
    <DetailPageHeaderSection className="border-b-0 pb-3">
      <div className="flex flex-wrap items-start justify-between gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="truncate text-lg font-semibold text-brand-navy sm:text-xl">
              {invoice.customer_uuid ? (
                <Link
                  href={ROUTES.customerDetail(invoice.customer_uuid)}
                  className="hover:text-brand-primary hover:underline"
                >
                  {customerName}
                </Link>
              ) : (
                customerName
              )}
            </h1>
            <span className="font-mono text-xs font-medium text-brand-slate">
              {invoiceLabel}
            </span>
            <InvoiceStatusBadge state={invoice.state} />
            {invoice.payment_status ? (
              <InvoicePaymentStatusBadge status={invoice.payment_status} />
            ) : null}
            {isInsurance && insuranceLabel !== "—" ? (
              <Badge variant="outline" className="gap-1 font-normal text-brand-slate">
                <Shield className="size-3 text-brand-primary" aria-hidden="true" />
                {insuranceLabel}
              </Badge>
            ) : null}
          </div>

          <div
            className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-brand-muted"
            data-testid="invoice-header-meta"
          >
            <span>Invoiced {formatInvoiceDate(invoice.invoice_date)}</span>
            {invoice.sales_order_id ? (
              <>
                <span aria-hidden="true" className="text-brand-border">
                  ·
                </span>
                <span>
                  Order:{" "}
                  <Link
                    href={ROUTES.salesOrderDetail(
                      invoice.sales_order_uuid ?? invoice.sales_order_id,
                    )}
                    className="font-medium text-brand-primary hover:underline"
                  >
                    {invoice.sales_order_name || `#${invoice.sales_order_id}`}
                  </Link>
                </span>
              </>
            ) : null}
            {claimMeta ? (
              <>
                <span aria-hidden="true" className="text-brand-border">
                  ·
                </span>
                <span data-testid="invoice-header-secondary-status">{claimMeta}</span>
              </>
            ) : null}
            {invoice.internal_reference ? (
              <>
                <span aria-hidden="true" className="text-brand-border">
                  ·
                </span>
                <span>Ref: {invoice.internal_reference}</span>
              </>
            ) : null}
          </div>
        </div>

        {actions ? <div className="ml-auto shrink-0">{actions}</div> : null}
      </div>
    </DetailPageHeaderSection>
  );
}
