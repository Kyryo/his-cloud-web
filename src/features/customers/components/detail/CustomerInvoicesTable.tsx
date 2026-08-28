"use client";

import { TableAmountCell, TableTextCell } from "@/components/table-text-cell";
import { SecondaryButton } from "@/components/ui/app-buttons";
import type { CustomerInvoiceRecord } from "@/features/customers/types/customer-billing.types";
import {
  InventoryListTable,
  type InventoryListTableColumn,
} from "@/features/inventory/components/list/InventoryListTable";
import { InvoiceStatusBadge } from "@/features/invoices/components/InvoiceStatusBadge";
import type { InvoiceState } from "@/features/invoices/types/invoice.types";
import { formatInvoiceDate } from "@/features/invoices/utils/format-invoice";

type CustomerInvoicesTableProps = {
  invoices: CustomerInvoiceRecord[];
  onRowClick?: (invoice: CustomerInvoiceRecord) => void;
};

export function CustomerInvoicesTable({
  invoices,
  onRowClick,
}: CustomerInvoicesTableProps) {
  const columns: InventoryListTableColumn<CustomerInvoiceRecord>[] = [
    {
      key: "invoice",
      label: "Invoice",
      render: (invoice) => (
        <TableTextCell className="font-medium text-brand-navy">
          {invoice.name || `#${invoice.id}`}
        </TableTextCell>
      ),
    },
    {
      key: "origin",
      label: "Sales order",
      render: (invoice) => (
        <TableTextCell className="text-brand-slate">
          {invoice.invoice_origin?.trim() || "—"}
        </TableTextCell>
      ),
    },
    {
      key: "date",
      label: "Invoice date",
      render: (invoice) => (
        <TableTextCell className="text-brand-slate">
          {formatInvoiceDate(invoice.invoice_date)}
        </TableTextCell>
      ),
    },
    {
      key: "state",
      label: "Status",
      render: (invoice) => (
        <InvoiceStatusBadge state={invoice.state as InvoiceState} />
      ),
    },
    {
      key: "total",
      label: "Total",
      headerClassName: "text-right",
      cellClassName: "text-right",
      render: (invoice) => (
        <TableAmountCell value={invoice.amount_total} currency="MWK" />
      ),
    },
    {
      key: "actions",
      label: "",
      headerClassName: "text-right",
      cellClassName: "text-right",
      render: (invoice) => (
        <div
          className="flex justify-end"
          onClick={(event) => event.stopPropagation()}
        >
          <SecondaryButton
            type="button"
            size="sm"
            onClick={() => onRowClick?.(invoice)}
          >
            View invoice
          </SecondaryButton>
        </div>
      ),
    },
  ];

  return (
    <InventoryListTable
      items={invoices}
      columns={columns}
      getRowKey={(invoice) => String(invoice.id)}
      onRowClick={onRowClick}
    />
  );
}
