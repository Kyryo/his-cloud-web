"use client";

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
import { PharmacyQueueDispenseStatusBadge } from "@/features/dispensation/components/PharmacyQueueDispenseStatusBadge";
import type { DispensationQueueItem } from "@/features/dispensation/types/dispensation.types";
import { formatDisplayDateTime } from "@/features/inventory/utils/format-inventory";

type PharmacyQueueTableProps = {
  items: DispensationQueueItem[];
  onRowClick?: (item: DispensationQueueItem) => void;
  className?: string;
};

const columns = [
  { key: "order", label: "Order" },
  { key: "patient", label: "Client" },
  { key: "clinic", label: "Clinic", className: "hidden md:table-cell" },
  { key: "status", label: "Status" },
  { key: "ordered", label: "Ordered" },
] as const;

export const PHARMACY_QUEUE_TABLE_SKELETON_COLUMNS = columns;

export function PharmacyQueueTable({
  items,
  onRowClick,
  className,
}: PharmacyQueueTableProps) {
  return (
    <ListPageDataTable className={className}>
      <ListPageDataTableHeader>
        <ListPageDataTableHeaderRow>
          {columns.map((column) => (
            <ListPageDataTableHeaderCell key={column.key} className={"className" in column ? column.className : undefined}>
              {column.label}
            </ListPageDataTableHeaderCell>
          ))}
        </ListPageDataTableHeaderRow>
      </ListPageDataTableHeader>
      <ListPageDataTableBody>
        {items.map((item) => {
          const patientName = item.customer_name?.trim() || "—";

          return (
            <ListPageDataTableRow
              key={item.uuid}
              className="group cursor-pointer"
              onClick={() => onRowClick?.(item)}
              data-testid={`pharmacy-queue-row-${item.uuid}`}
            >
              <ListPageDataTableCell className="font-mono font-medium text-brand-navy group-hover:text-brand-primary">
                {item.name}
              </ListPageDataTableCell>
              <ListPageDataTableCell>
                <div className="flex min-w-0 items-center gap-2.5">
                  <UserIdenticon
                    seed={patientName}
                    name={patientName}
                    className="size-8 shrink-0 rounded-md"
                  />
                  <span className="truncate font-medium text-brand-navy">
                    {patientName}
                  </span>
                </div>
              </ListPageDataTableCell>
              <ListPageDataTableCell className="hidden text-brand-slate md:table-cell">
                {item.clinic_name || "—"}
              </ListPageDataTableCell>
              <ListPageDataTableCell>
                <PharmacyQueueDispenseStatusBadge
                  dispensableLineCount={item.dispensable_line_count}
                  remainingLineCount={item.remaining_line_count}
                />
              </ListPageDataTableCell>
              <ListPageDataTableCell className="tabular-nums text-dash-muted">
                {formatDisplayDateTime(item.date_order)}
              </ListPageDataTableCell>
            </ListPageDataTableRow>
          );
        })}
      </ListPageDataTableBody>
    </ListPageDataTable>
  );
}
