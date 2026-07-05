"use client";

import { TableAmountCell, TableEntityCell, TableTextCell } from "@/components/table-text-cell";
import { Button } from "@/components/ui/button";
import { InvoicePaymentStatusBadge } from "@/features/invoices/components/InvoicePaymentStatusBadge";
import { InvoiceStatusBadge } from "@/features/invoices/components/InvoiceStatusBadge";
import type { Invoice } from "@/features/invoices/types/invoice.types";
import {
  formatInvoiceCustomer,
  formatInvoiceDate,
  formatInvoicePricelist,
} from "@/features/invoices/utils/format-invoice";
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
        <table className="min-w-full table-fixed">
          <thead>
            <tr className="border-b border-brand-border bg-slate-50/80">
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={cn(
                    "px-4 py-3 text-sm font-medium text-brand-muted",
                    column.key === "total" ? "text-right" : "text-left",
                  )}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {invoices.map((invoice) => {
              const invoiceLabel = invoice.name || `#${invoice.id}`;
              const customerName = formatInvoiceCustomer(invoice);
              const salesOrderLabel =
                invoice.sales_order_name || `#${invoice.sales_order_id}`;

              return (
                <tr
                  key={invoice.id}
                  className={cn(onRowClick && "cursor-pointer hover:bg-slate-50/80")}
                  onClick={() => onRowClick?.(invoice)}
                  data-testid={`invoice-row-${invoice.id}`}
                >
                  <td className="px-4 py-3">
                    <TableTextCell className="font-medium text-brand-navy">
                      {invoiceLabel}
                    </TableTextCell>
                  </td>
                  <td className="px-4 py-3">
                    <TableEntityCell name={customerName} />
                  </td>
                  <td className="px-4 py-3">
                    {invoice.sales_order_id ? (
                      <TableTextCell className="text-brand-slate" title={salesOrderLabel}>
                        {salesOrderLabel}
                      </TableTextCell>
                    ) : (
                      <TableTextCell className="text-brand-slate">—</TableTextCell>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <TableTextCell className="text-brand-slate">
                      {formatInvoicePricelist(invoice)}
                    </TableTextCell>
                  </td>
                  <td className="px-4 py-3">
                    <TableTextCell className="text-brand-slate">
                      {formatInvoiceDate(invoice.invoice_date)}
                    </TableTextCell>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <InvoiceStatusBadge state={invoice.state} />
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {invoice.payment_status ? (
                      <InvoicePaymentStatusBadge status={invoice.payment_status} />
                    ) : (
                      <TableTextCell className="text-brand-slate">—</TableTextCell>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <TableAmountCell value={invoice.amount_total} currency="MWK" />
                  </td>
                </tr>
              );
            })}
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
    <div className="mt-4 flex items-center justify-between gap-3">
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
