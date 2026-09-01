"use client";

import { TableAmountCell } from "@/components/table-text-cell";
import { UserIdenticon } from "@/components/UserIdenticon";
import {
  ListPageDataTable,
  ListPageDataTableBody,
  ListPageDataTableCell,
  ListPageDataTableHeader,
  ListPageDataTableHeaderCell,
  ListPageDataTableHeaderRow,
  ListPageDataTableRow,
} from "@/features/app-shell/components/page-layout";
import { InvoicePaymentStatusBadge } from "@/features/invoices/components/InvoicePaymentStatusBadge";
import { InvoiceStatusBadge } from "@/features/invoices/components/InvoiceStatusBadge";
import type { Invoice } from "@/features/invoices/types/invoice.types";
import {
  formatInvoiceCustomer,
  formatInvoiceDate,
  formatInvoicePricelist,
} from "@/features/invoices/utils/format-invoice";

type InvoicesTableProps = {
  invoices: Invoice[];
  onRowClick?: (invoice: Invoice) => void;
  className?: string;
};

const columns = [
  { key: "invoice", label: "Invoice" },
  { key: "customer", label: "Client" },
  { key: "salesOrder", label: "Sales order", className: "hidden md:table-cell" },
  { key: "pricelist", label: "Pricelist", className: "hidden lg:table-cell" },
  { key: "date", label: "Invoice date" },
  { key: "state", label: "State" },
  { key: "payment", label: "Payment" },
  { key: "total", label: "Total", className: "text-right pr-4" },
] as const;

export const INVOICE_TABLE_SKELETON_COLUMNS = [
  { key: "invoice", label: "Invoice" },
  { key: "customer", label: "Client" },
  { key: "salesOrder", label: "Sales order", headerClassName: "hidden md:table-cell" },
  { key: "pricelist", label: "Pricelist", headerClassName: "hidden lg:table-cell" },
  { key: "date", label: "Invoice date" },
  { key: "state", label: "State" },
  { key: "payment", label: "Payment" },
  { key: "total", label: "Total", headerClassName: "text-right pr-4" },
] as const;

export function InvoicesTable({ invoices, onRowClick, className }: InvoicesTableProps) {
  return (
    <ListPageDataTable className={className}>
      <ListPageDataTableHeader>
        <ListPageDataTableHeaderRow>
          {columns.map((column) => (
            <ListPageDataTableHeaderCell key={column.key} className={column.className}>
              {column.label}
            </ListPageDataTableHeaderCell>
          ))}
        </ListPageDataTableHeaderRow>
      </ListPageDataTableHeader>
      <ListPageDataTableBody>
        {invoices.map((invoice) => {
          const invoiceLabel = invoice.name || `#${invoice.id}`;
          const customerName = formatInvoiceCustomer(invoice);
          const salesOrderLabel =
            invoice.sales_order_name ||
            (invoice.sales_order_id ? `#${invoice.sales_order_id}` : "—");

          return (
            <ListPageDataTableRow
              key={invoice.id}
              className="group cursor-pointer transition-colors hover:bg-slate-50/70"
              onClick={() => onRowClick?.(invoice)}
              data-testid={`invoice-row-${invoice.id}`}
            >
              <ListPageDataTableCell className="py-3">
                <span className="font-mono text-xs font-semibold tracking-tight text-brand-navy group-hover:text-brand-primary">
                  {invoiceLabel}
                </span>
              </ListPageDataTableCell>
              <ListPageDataTableCell className="py-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <UserIdenticon
                    seed={customerName}
                    name={customerName}
                    className="size-7.5 shrink-0 rounded-lg shadow-2xs"
                  />
                  <span className="truncate text-sm font-medium text-brand-navy">
                    {customerName}
                  </span>
                </div>
              </ListPageDataTableCell>
              <ListPageDataTableCell className="hidden py-3 font-mono text-xs text-brand-slate md:table-cell">
                {salesOrderLabel}
              </ListPageDataTableCell>
              <ListPageDataTableCell className="hidden py-3 text-xs text-brand-slate lg:table-cell">
                {formatInvoicePricelist(invoice)}
              </ListPageDataTableCell>
              <ListPageDataTableCell className="py-3 text-xs tabular-nums text-dash-muted">
                {formatInvoiceDate(invoice.invoice_date)}
              </ListPageDataTableCell>
              <ListPageDataTableCell className="py-3">
                <InvoiceStatusBadge state={invoice.state} />
              </ListPageDataTableCell>
              <ListPageDataTableCell className="py-3">
                {invoice.payment_status ? (
                  <InvoicePaymentStatusBadge status={invoice.payment_status} />
                ) : (
                  <span className="text-xs text-dash-muted">—</span>
                )}
              </ListPageDataTableCell>
              <ListPageDataTableCell className="py-3 pr-4 text-right">
                <div className="text-sm font-semibold tabular-nums text-brand-navy">
                  <TableAmountCell value={invoice.amount_total} currency="MWK" />
                </div>
              </ListPageDataTableCell>
            </ListPageDataTableRow>
          );
        })}
      </ListPageDataTableBody>
    </ListPageDataTable>
  );
}
