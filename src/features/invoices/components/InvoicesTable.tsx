"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { InvoicePaymentStatusBadge } from "@/features/invoices/components/InvoicePaymentStatusBadge";
import { InvoiceStatusBadge } from "@/features/invoices/components/InvoiceStatusBadge";
import type { Invoice } from "@/features/invoices/types/invoice.types";
import {
  formatInvoiceAmount,
  formatInvoiceCustomer,
  formatInvoiceDate,
  formatInvoicePricelist,
} from "@/features/invoices/utils/format-invoice";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

type InvoicesTableProps = {
  invoices: Invoice[];
  onRowClick?: (invoice: Invoice) => void;
  className?: string;
};

const columns = [
  { key: "invoice", label: "Invoice" },
  { key: "customer", label: "Customer" },
  { key: "salesOrder", label: "Sales order" },
  { key: "pricelist", label: "Pricelist" },
  { key: "date", label: "Invoice date" },
  { key: "state", label: "State" },
  { key: "payment", label: "Payment" },
  { key: "total", label: "Total" },
] as const;

export function InvoicesTable({ invoices, onRowClick, className }: InvoicesTableProps) {
  return (
    <div className={cn("overflow-hidden rounded-xl border border-brand-border bg-white", className)}>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-brand-border bg-slate-50/80">
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className="px-4 py-3 text-left text-sm font-medium text-brand-muted"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {invoices.map((invoice) => (
              <tr
                key={invoice.id}
                className={cn(onRowClick && "cursor-pointer hover:bg-slate-50/80")}
                onClick={() => onRowClick?.(invoice)}
                data-testid={`invoice-row-${invoice.id}`}
              >
                <td className="px-4 py-3 text-sm font-medium text-brand-navy">
                  {invoice.name || `#${invoice.id}`}
                </td>
                <td className="px-4 py-3 text-sm text-brand-slate">
                  {invoice.customer_uuid ? (
                    <Link
                      href={ROUTES.customerDetail(invoice.customer_uuid)}
                      className="hover:text-brand-primary hover:underline"
                      onClick={(event) => event.stopPropagation()}
                    >
                      {formatInvoiceCustomer(invoice)}
                    </Link>
                  ) : (
                    formatInvoiceCustomer(invoice)
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-brand-slate">
                  {invoice.sales_order_id ? (
                    <Link
                      href={ROUTES.salesOrderDetail(invoice.sales_order_id)}
                      className="hover:text-brand-primary hover:underline"
                      onClick={(event) => event.stopPropagation()}
                    >
                      {invoice.sales_order_name || `#${invoice.sales_order_id}`}
                    </Link>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-brand-slate">
                  {formatInvoicePricelist(invoice)}
                </td>
                <td className="px-4 py-3 text-sm text-brand-slate">
                  {formatInvoiceDate(invoice.invoice_date)}
                </td>
                <td className="px-4 py-3 text-sm">
                  <InvoiceStatusBadge state={invoice.state} />
                </td>
                <td className="px-4 py-3 text-sm">
                  {invoice.payment_status ? (
                    <InvoicePaymentStatusBadge status={invoice.payment_status} />
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-brand-navy">
                  {formatInvoiceAmount(invoice.amount_total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

type InvoicesPaginationProps = {
  page: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
};

export function InvoicesPagination({
  page,
  pageSize,
  totalCount,
  onPageChange,
}: InvoicesPaginationProps) {
  const hasNext = page * pageSize < totalCount;
  const hasPrevious = page > 1;

  return (
    <div className="flex items-center justify-between gap-3">
      <p className="text-sm text-brand-muted">
        Showing {invoicesRangeLabel(page, pageSize, totalCount)} of {totalCount}
      </p>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!hasPrevious}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!hasNext}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

function invoicesRangeLabel(page: number, pageSize: number, totalCount: number) {
  if (totalCount === 0) {
    return "0";
  }
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalCount);
  return `${start}-${end}`;
}
