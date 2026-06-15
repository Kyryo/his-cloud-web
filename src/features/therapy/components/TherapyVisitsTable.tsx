import { CalendarClock } from "lucide-react";

import { ClientAvatar } from "@/components/client-avatar";
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
import { TherapyVisitStatusBadge } from "@/features/therapy/components/TherapyVisitStatusBadge";
import type { TherapyVisit } from "@/features/therapy/types/therapy.types";

const DATE_FORMATTER = new Intl.DateTimeFormat("en-MW", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const TIME_FORMATTER = new Intl.DateTimeFormat("en-MW", {
  hour: "2-digit",
  minute: "2-digit",
});

const COLUMNS = [
  "Client",
  "Gender",
  "Visit date",
  "Service",
  "Payment",
  "Visit status",
] as const;

export function TherapyVisitsTable({
  visits,
  onRowClick,
}: {
  visits: TherapyVisit[];
  onRowClick: (visit: TherapyVisit) => void;
}) {
  return (
    <ListPageDataTable>
      <ListPageDataTableHeader>
        <ListPageDataTableHeaderRow>
          {COLUMNS.map((label) => (
            <ListPageDataTableHeaderCell
              key={label}
              className="whitespace-nowrap"
            >
              {label}
            </ListPageDataTableHeaderCell>
          ))}
        </ListPageDataTableHeaderRow>
      </ListPageDataTableHeader>
      <ListPageDataTableBody>
        {visits.map((visit) => {
          const visitDate = new Date(visit.visit_date);

          return (
            <ListPageDataTableRow
              key={visit.uuid}
              className="cursor-pointer"
              tabIndex={0}
              onClick={() => onRowClick(visit)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onRowClick(visit);
                }
              }}
            >
              <ListPageDataTableCell>
                <div className="flex min-w-48 items-center gap-3">
                  <ClientAvatar name={visit.customer_name} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-brand-navy">
                      {visit.customer_name}
                    </p>
                    <p className="text-xs text-brand-muted">
                      {visit.customer_identifier}
                    </p>
                  </div>
                </div>
              </ListPageDataTableCell>
              <ListPageDataTableCell className="whitespace-nowrap text-sm text-brand-slate">
                {visit.customer_gender || "Not recorded"}
              </ListPageDataTableCell>
              <ListPageDataTableCell className="whitespace-nowrap text-sm text-brand-slate">
                <span className="flex items-center gap-2">
                  <CalendarClock className="size-4 text-brand-muted" />
                  {DATE_FORMATTER.format(visitDate)}
                  <span className="text-xs text-brand-muted">
                    {TIME_FORMATTER.format(visitDate)}
                  </span>
                </span>
              </ListPageDataTableCell>
              <ListPageDataTableCell className="text-sm text-brand-slate">
                {visit.consultation_service_name || "Therapy visit"}
              </ListPageDataTableCell>
              <ListPageDataTableCell>
                <Badge variant="outline">
                  {visit.mode_of_payment === "insurance"
                    ? "Insurance"
                    : "Cash"}
                </Badge>
              </ListPageDataTableCell>
              <ListPageDataTableCell>
                <TherapyVisitStatusBadge status={visit.status} />
              </ListPageDataTableCell>
            </ListPageDataTableRow>
          );
        })}
      </ListPageDataTableBody>
    </ListPageDataTable>
  );
}
