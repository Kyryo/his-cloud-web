"use client";

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
  formatLabOrderedRelative,
  formatLabOrderPriorityLabel,
  formatLabPatientName,
  isUrgentPriority,
} from "@/features/laboratory/utils/format-lab-order";
import { formatAge } from "@/lib/age";
import { cn } from "@/lib/utils";

type LabOrdersTableProps = {
  orders: LabOrder[];
  onRowClick?: (order: LabOrder) => void;
  className?: string;
};

const columns = [
  { key: "patient", label: "Patient" },
  { key: "gender", label: "Gender", className: "hidden sm:table-cell" },
  { key: "clinic", label: "Clinic", className: "hidden md:table-cell" },
  { key: "priority", label: "Priority" },
  { key: "status", label: "Status" },
  { key: "ordered_by", label: "Ordered by", className: "hidden xl:table-cell" },
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
        {orders.map((order) => {
          const name = formatLabPatientName(order);
          const identifier = order.customer_identifier?.trim() || "—";
          const identiconSeed =
            order.customer_uuid || identifier || name;
          const ageLabel = formatAge(order.customer_dob);
          const gender = order.customer_gender?.trim() || "—";

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
                    <p className="truncate text-[13px] font-medium text-brand-navy transition-colors group-hover:text-brand-primary">
                      {name}
                    </p>
                    <p className="truncate font-mono text-[12px] text-brand-muted">
                      {[identifier, ageLabel !== "—" ? ageLabel : null]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                </div>
              </ListPageDataTableCell>
              <ListPageDataTableCell className="hidden sm:table-cell">
                <span className="text-sm text-brand-navy">{gender}</span>
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
                <div className="flex flex-wrap items-center gap-1.5">
                  <LabOrderStatusBadge status={order.status} />
                  {order.is_referred_in || order.referral_uuid ? (
                    <Badge
                      variant="outline"
                      className="font-normal"
                      data-testid={`lab-order-referred-in-${order.uuid}`}
                    >
                      Referred in
                    </Badge>
                  ) : null}
                </div>
              </ListPageDataTableCell>
              <ListPageDataTableCell className="hidden xl:table-cell">
                <span className="text-sm text-brand-slate">
                  {order.ordered_by_name?.trim() || "—"}
                </span>
              </ListPageDataTableCell>
              <ListPageDataTableCell className="hidden lg:table-cell">
                <span className="whitespace-nowrap text-sm text-brand-slate">
                  {formatLabOrderedRelative(order.ordered_at)}
                </span>
              </ListPageDataTableCell>
            </ListPageDataTableRow>
          );
        })}
      </ListPageDataTableBody>
    </ListPageDataTable>
  );
}
