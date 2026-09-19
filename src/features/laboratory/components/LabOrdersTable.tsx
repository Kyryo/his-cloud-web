"use client";

import Link from "next/link";

import { UserIdenticon } from "@/components/UserIdenticon";
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
  formatLabDisplayDateTime,
  formatLabOrderPriorityLabel,
  formatLabPatientName,
  isUrgentPriority,
} from "@/features/laboratory/utils/format-lab-order";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

type LabOrdersTableProps = {
  orders: LabOrder[];
  onRowClick?: (order: LabOrder) => void;
  className?: string;
};

const columns = [
  { key: "patient", label: "Patient" },
  { key: "clinic", label: "Clinic", className: "hidden md:table-cell" },
  { key: "priority", label: "Priority" },
  { key: "status", label: "Status" },
  { key: "items", label: "Items", className: "hidden sm:table-cell" },
  { key: "ordered_by", label: "Ordered by", className: "hidden lg:table-cell" },
  { key: "ordered", label: "Ordered", className: "hidden lg:table-cell" },
] as const;

function itemsSummary(order: LabOrder): string {
  const names = (order.items ?? [])
    .map((item) => item.test_name || item.test_code)
    .filter(Boolean);
  if (names.length === 0) {
    return "—";
  }
  if (names.length <= 2) {
    return names.join(", ");
  }
  return `${names.slice(0, 2).join(", ")} +${names.length - 2}`;
}

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
        {orders.map((order) => {
          const name = formatLabPatientName(order);
          const identifier = order.customer_identifier?.trim() || "—";
          const identiconSeed =
            order.customer_uuid || identifier || name;

          return (
            <ListPageDataTableRow
              key={order.uuid}
              className={cn("group", onRowClick && "cursor-pointer")}
              onClick={() => onRowClick?.(order)}
              data-testid={`lab-order-row-${order.uuid}`}
            >
              <ListPageDataTableCell>
                <div className="flex min-w-0 items-center gap-2.5">
                  <UserIdenticon
                    seed={identiconSeed}
                    name={name}
                    className="size-8 shrink-0 rounded-md"
                  />
                  <div className="min-w-0 space-y-0.5">
                    <Link
                      href={ROUTES.customerDetail(order.customer_uuid)}
                      onClick={(event) => event.stopPropagation()}
                      className="block truncate text-[13px] font-medium text-brand-navy transition-colors group-hover:text-brand-primary"
                    >
                      {name}
                    </Link>
                    <p className="truncate font-mono text-[12px] text-brand-muted">
                      {identifier}
                    </p>
                  </div>
                </div>
              </ListPageDataTableCell>
              <ListPageDataTableCell className="hidden md:table-cell">
                <span className="text-sm text-brand-navy">
                  {order.clinic_name || "—"}
                </span>
              </ListPageDataTableCell>
              <ListPageDataTableCell>
                <Badge
                  variant={
                    isUrgentPriority(order.priority) ? "destructive" : "outline"
                  }
                  className="font-normal"
                >
                  {formatLabOrderPriorityLabel(order.priority)}
                </Badge>
              </ListPageDataTableCell>
              <ListPageDataTableCell>
                <LabOrderStatusBadge status={order.status} />
              </ListPageDataTableCell>
              <ListPageDataTableCell className="hidden sm:table-cell">
                <span
                  className="line-clamp-2 text-sm text-brand-slate"
                  title={(order.items ?? [])
                    .map((item) => item.test_name)
                    .filter(Boolean)
                    .join(", ")}
                >
                  {itemsSummary(order)}
                </span>
              </ListPageDataTableCell>
              <ListPageDataTableCell className="hidden lg:table-cell">
                <span className="text-sm text-brand-slate">
                  {order.ordered_by_name?.trim() || "—"}
                </span>
              </ListPageDataTableCell>
              <ListPageDataTableCell className="hidden lg:table-cell">
                <span className="text-sm text-brand-slate">
                  {formatLabDisplayDateTime(order.ordered_at)}
                </span>
              </ListPageDataTableCell>
            </ListPageDataTableRow>
          );
        })}
      </ListPageDataTableBody>
    </ListPageDataTable>
  );
}
