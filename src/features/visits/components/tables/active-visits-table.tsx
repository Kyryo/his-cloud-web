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
import { CustomerVisitStatusBadge } from "@/features/customers/components/CustomerVisitStatusBadge";
import { formatDisplayDateTime } from "@/features/customers/utils/format-customer";
import type { VisitDetail } from "@/features/visits/types/visit.types";

type ActiveVisitsTableProps = {
  visits: VisitDetail[];
  onRowClick?: (visit: VisitDetail) => void;
  className?: string;
};

const columns = [
  { key: "patient", label: "Client" },
  { key: "service", label: "Service" },
  { key: "clinic", label: "Clinic", className: "hidden md:table-cell" },
  { key: "status", label: "Status" },
  { key: "visit_date", label: "Started" },
] as const;

export const ACTIVE_VISITS_TABLE_SKELETON_COLUMNS = columns;

export function ActiveVisitsTable({
  visits,
  onRowClick,
  className,
}: ActiveVisitsTableProps) {
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
        {visits.map((visit) => {
          const clientName = visit.customer_name?.trim() || "—";

          return (
            <ListPageDataTableRow
              key={visit.uuid}
              className="group cursor-pointer"
              onClick={() => onRowClick?.(visit)}
              data-testid={`active-visit-row-${visit.uuid}`}
            >
              <ListPageDataTableCell>
                <div className="flex min-w-0 items-center gap-2.5">
                  <UserIdenticon
                    seed={visit.customer || clientName}
                    name={clientName}
                    className="size-8 shrink-0 rounded-md"
                  />
                  <div className="min-w-0">
                    <span className="block truncate font-medium text-brand-navy group-hover:text-brand-primary">
                      {clientName}
                    </span>
                    {visit.customer_identifier ? (
                      <span className="block truncate font-mono text-dash-muted">
                        {visit.customer_identifier}
                      </span>
                    ) : null}
                  </div>
                </div>
              </ListPageDataTableCell>
              <ListPageDataTableCell>
                {visit.consultation_service_name || "—"}
              </ListPageDataTableCell>
              <ListPageDataTableCell className="hidden md:table-cell">
                {visit.clinic_name || "—"}
              </ListPageDataTableCell>
              <ListPageDataTableCell>
                <CustomerVisitStatusBadge status={visit.status} />
              </ListPageDataTableCell>
              <ListPageDataTableCell className="tabular-nums text-dash-muted">
                {formatDisplayDateTime(visit.visit_date)}
              </ListPageDataTableCell>
            </ListPageDataTableRow>
          );
        })}
      </ListPageDataTableBody>
    </ListPageDataTable>
  );
}
