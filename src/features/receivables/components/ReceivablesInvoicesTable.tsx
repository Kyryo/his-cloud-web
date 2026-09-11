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
import { ReceivablesAgingBadge } from "@/features/receivables/components/ReceivablesAgingBadge";
import type { ReceivablesInvoice } from "@/features/receivables/types/receivables.types";
import {
  formatReceivablesClientName,
  formatReceivablesDaysOutstanding,
  formatReceivablesIdentifier,
  formatReceivablesInvoiceDate,
} from "@/features/receivables/utils/format-receivables";

type ReceivablesInvoicesTableProps = {
  invoices: ReceivablesInvoice[];
  onRowClick?: (invoice: ReceivablesInvoice) => void;
};

const columns = [
  { key: "invoice", label: "Invoice" },
  { key: "client", label: "Client" },
  { key: "date", label: "Date", className: "hidden md:table-cell" },
  { key: "days", label: "Outstanding", className: "hidden lg:table-cell" },
  { key: "aging", label: "Aging" },
  { key: "balance", label: "Balance", align: "right" as const },
] as const;

export const RECEIVABLES_INVOICES_SKELETON_COLUMNS = columns;

export function ReceivablesInvoicesTable({
  invoices,
  onRowClick,
}: ReceivablesInvoicesTableProps) {
  return (
    <ListPageDataTable>
      <ListPageDataTableHeader>
        <ListPageDataTableHeaderRow>
          {columns.map((column) => (
            <ListPageDataTableHeaderCell
              key={column.key}
              className={
                "align" in column && column.align === "right"
                  ? "text-right pr-4"
                  : "className" in column
                    ? column.className
                    : undefined
              }
            >
              {column.label}
            </ListPageDataTableHeaderCell>
          ))}
        </ListPageDataTableHeaderRow>
      </ListPageDataTableHeader>
      <ListPageDataTableBody>
        {invoices.map((invoice) => {
          const name = formatReceivablesClientName(invoice.customer_name);
          const identifier = formatReceivablesIdentifier(
            invoice.customer_identifier,
          );
          const currency = invoice.currency?.trim() || undefined;

          return (
            <ListPageDataTableRow
              key={invoice.invoice_uuid}
              className="group cursor-pointer"
              onClick={() => onRowClick?.(invoice)}
              data-testid={`receivables-invoice-${invoice.invoice_uuid}`}
            >
              <ListPageDataTableCell className="py-3">
                <p className="font-mono text-sm font-semibold tracking-tight text-brand-navy group-hover:text-brand-primary">
                  {invoice.invoice_number}
                </p>
                <p className="text-xs text-brand-muted md:hidden">
                  {formatReceivablesInvoiceDate(invoice.invoice_date)}
                </p>
              </ListPageDataTableCell>
              <ListPageDataTableCell className="py-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <UserIdenticon
                    seed={invoice.customer_uuid || name}
                    name={name}
                    className="size-8 shrink-0 rounded-lg shadow-2xs"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-brand-navy">
                      {name}
                    </p>
                    <p
                      className="truncate font-mono text-xs text-brand-muted"
                      title={invoice.customer_identifier ?? undefined}
                    >
                      {identifier}
                    </p>
                  </div>
                </div>
              </ListPageDataTableCell>
              <ListPageDataTableCell className="hidden py-3 text-sm tabular-nums text-dash-muted md:table-cell">
                {formatReceivablesInvoiceDate(invoice.invoice_date)}
              </ListPageDataTableCell>
              <ListPageDataTableCell className="hidden py-3 text-sm tabular-nums text-brand-navy lg:table-cell">
                {formatReceivablesDaysOutstanding(invoice.days_outstanding)}
              </ListPageDataTableCell>
              <ListPageDataTableCell className="py-3">
                <ReceivablesAgingBadge bucket={invoice.aging_bucket} />
              </ListPageDataTableCell>
              <ListPageDataTableCell className="py-3 pr-4 text-right">
                <TableAmountCell
                  value={invoice.balance}
                  currency={currency}
                  className="font-semibold"
                />
              </ListPageDataTableCell>
            </ListPageDataTableRow>
          );
        })}
      </ListPageDataTableBody>
    </ListPageDataTable>
  );
}
