"use client";

import Link from "next/link";

import { InvoiceStatusBadge } from "@/features/invoices/components/InvoiceStatusBadge";
import type { Invoice } from "@/features/invoices/types/invoice.types";
import {
  formatInvoiceAmount,
  formatInvoiceCustomer,
  formatInvoiceDate,
} from "@/features/invoices/utils/format-invoice";
import { ROUTES } from "@/constants/routes";
import { DetailPageHeaderSection } from "@/features/app-shell/components/page-layout";

type InvoiceDetailHeaderProps = {
  invoice: Invoice;
};

export function InvoiceDetailHeader({ invoice }: InvoiceDetailHeaderProps) {
  const invoiceLabel = invoice.name || `Invoice #${invoice.id}`;
  const customerName = formatInvoiceCustomer(invoice);

  return (
    <DetailPageHeaderSection>
      <div className="flex flex-wrap items-start justify-between gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="truncate text-lg font-semibold text-brand-navy sm:text-xl">
              {customerName}
            </h1>
            <InvoiceStatusBadge state={invoice.state} />
          </div>

          <p className="mt-1 font-mono text-sm text-brand-muted">{invoiceLabel}</p>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-brand-muted">
            <span>Invoiced {formatInvoiceDate(invoice.invoice_date)}</span>
            <span>Total {formatInvoiceAmount(invoice.amount_total)}</span>
            {invoice.sales_order_id ? (
              <Link
                href={ROUTES.salesOrderDetail(invoice.sales_order_id)}
                className="text-brand-primary hover:underline"
              >
                {invoice.sales_order_name || `Order #${invoice.sales_order_id}`}
              </Link>
            ) : null}
            {invoice.customer_uuid ? (
              <Link
                href={ROUTES.customerDetail(invoice.customer_uuid)}
                className="text-brand-primary hover:underline"
              >
                View client
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </DetailPageHeaderSection>
  );
}
