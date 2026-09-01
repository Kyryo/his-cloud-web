"use client";

import { Eye, MoreVertical } from "lucide-react";

import { TableTextCell } from "@/components/table-text-cell";
import { SecondaryButton } from "@/components/ui/app-buttons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CustomerVisitStatusBadge } from "@/features/customers/components/CustomerVisitStatusBadge";
import type { CustomerVisit } from "@/features/customers/types/customer-visit.types";
import { formatDisplayDateTime } from "@/features/customers/utils/format-customer";
import {
  formatVisitPaymentLabel,
  formatVisitSchemeLabel,
} from "@/features/customers/utils/format-visit-scheme";
import {
  InventoryListTable,
  type InventoryListTableColumn,
} from "@/features/inventory/components/list/InventoryListTable";

type CustomerVisitsTableProps = {
  visits: CustomerVisit[];
  onEdit: (visit: CustomerVisit) => void;
  onView: (visit: CustomerVisit) => void;
};

export function CustomerVisitsTable({
  visits,
  onEdit,
  onView,
}: CustomerVisitsTableProps) {
  const columns: InventoryListTableColumn<CustomerVisit>[] = [
    {
      key: "date",
      label: "Date",
      render: (visit) => (
        <TableTextCell className="font-medium text-brand-navy">
          {formatDisplayDateTime(visit.visit_date)}
        </TableTextCell>
      ),
    },
    {
      key: "payment",
      label: "Payment",
      render: (visit) => (
        <TableTextCell className="text-brand-slate">
          {formatVisitPaymentLabel(visit)}
        </TableTextCell>
      ),
    },
    {
      key: "scheme",
      label: "Scheme",
      render: (visit) => (
        <TableTextCell className="text-brand-slate">
          {formatVisitSchemeLabel(visit)}
        </TableTextCell>
      ),
    },
    {
      key: "clinic",
      label: "Clinic",
      render: (visit) => (
        <TableTextCell className="text-brand-slate">
          {visit.clinic_name || "—"}
        </TableTextCell>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (visit) => <CustomerVisitStatusBadge status={visit.status} />,
    },
    {
      key: "actions",
      label: "",
      headerClassName: "text-right",
      cellClassName: "text-right",
      render: (visit) => (
        <div
          className="flex items-center justify-end gap-1.5"
          onClick={(event) => event.stopPropagation()}
        >
          <SecondaryButton
            type="button"
            size="sm"
            disabled={!visit.can_edit_mode_of_payment}
            title={visit.mode_of_payment_edit_block_reason ?? undefined}
            onClick={() => onEdit(visit)}
            data-testid={`customer-visit-edit-${visit.uuid}`}
          >
            Edit
          </SecondaryButton>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                size="icon"
                variant="outline"
                className="size-8 rounded-full"
                aria-label={`More actions for visit on ${formatDisplayDateTime(visit.visit_date)}`}
                data-testid={`customer-visit-actions-${visit.uuid}`}
              >
                <MoreVertical className="size-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                onClick={() => onView(visit)}
                data-testid={`customer-visit-view-${visit.uuid}`}
              >
                <Eye className="size-4" aria-hidden="true" />
                View
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return (
    <InventoryListTable
      items={visits}
      columns={columns}
      getRowKey={(visit) => visit.uuid}
      onRowClick={onView}
    />
  );
}
