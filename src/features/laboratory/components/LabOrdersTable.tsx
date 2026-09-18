"use client";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import {
  ListPageDataTable,
  ListPageDataTableBody,
  ListPageDataTableCell,
  ListPageDataTableHeader,
  ListPageDataTableHeaderCell,
  ListPageDataTableHeaderRow,
  ListPageDataTableRow,
} from "@/features/app-shell/components/page-layout";
import { LabOrderStatusBadge } from "@/features/laboratory/components/LabOrderStatusBadge";
import type { LabOrder } from "@/features/laboratory/types/laboratory.types";
import {
  formatLabAccession,
  formatLabDisplayDateTime,
  formatLabOrderPriorityLabel,
  isUrgentPriority,
  shortenUuid,
} from "@/features/laboratory/utils/format-lab-order";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

type LabOrdersTableProps = {
  orders: LabOrder[];
  onRowClick?: (order: LabOrder) => void;
  className?: string;
};

const columns = [
  { key: "accession", label: "Accession" },
  { key: "patient", label: "Patient" },
  { key: "clinic", label: "Clinic", className: "hidden md:table-cell" },
  { key: "priority", label: "Priority" },
  { key: "status", label: "Status" },
  { key: "items", label: "Items", className: "hidden sm:table-cell" },
  { key: "ordered", label: "Ordered", className: "hidden lg:table-cell" },
] as const;

export function LabOrdersTable({
  orders,
  onRowClick,
  className,
}: LabOrdersTableProps) {
  return (
    <ListPageDataTable className={className}>
      <ListPageDataTableHeader>
        <ListPageDataTableHeaderRow>
          {columns.map((column) => (
            <ListPageDataTableHeaderCell
              key={column.key}
              className={"className" in column ? column.className : undefined}
            >
              {column.label}
            </ListPageDataTableHeaderCell>
          ))}
        </ListPageDataTableHeaderRow>
      </ListPageDataTableHeader>
      <ListPageDataTableBody>
        {orders.map((order) => (
          <ListPageDataTableRow
            key={order.uuid}
            className={cn(onRowClick && "cursor-pointer")}
            onClick={() => onRowClick?.(order)}
            data-testid={`lab-order-row-${order.uuid}`}
          >
            <ListPageDataTableCell>
              <span className="font-mono text-sm font-semibold text-brand-navy">
                {formatLabAccession(order)}
              </span>
            </ListPageDataTableCell>
            <ListPageDataTableCell>
              <Link
                href={ROUTES.customerDetail(order.customer_uuid)}
                onClick={(event) => event.stopPropagation()}
                className="font-mono text-sm font-medium text-brand-primary hover:underline"
              >
                {shortenUuid(order.customer_uuid)}
              </Link>
            </ListPageDataTableCell>
            <ListPageDataTableCell className="hidden md:table-cell">
              <span className="text-sm text-brand-navy">
                {order.clinic_name || "—"}
              </span>
            </ListPageDataTableCell>
            <ListPageDataTableCell>
              <Badge
                variant={isUrgentPriority(order.priority) ? "destructive" : "outline"}
                className="font-normal"
              >
                {formatLabOrderPriorityLabel(order.priority)}
              </Badge>
            </ListPageDataTableCell>
            <ListPageDataTableCell>
              <LabOrderStatusBadge status={order.status} />
            </ListPageDataTableCell>
            <ListPageDataTableCell className="hidden sm:table-cell">
              <span className="text-sm text-brand-slate">
                {order.items?.length ?? 0}
              </span>
            </ListPageDataTableCell>
            <ListPageDataTableCell className="hidden lg:table-cell">
              <span className="text-sm text-brand-slate">
                {formatLabDisplayDateTime(order.ordered_at)}
              </span>
            </ListPageDataTableCell>
          </ListPageDataTableRow>
        ))}
      </ListPageDataTableBody>
    </ListPageDataTable>
  );
}
